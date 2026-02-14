const { Op } = require('sequelize');
const { Meal, Nutrition, Client } = require('../models');

/**
 * 일일 영양 분석
 * @param {number} clientId - 고객 ID
 * @param {string} date - 분석 날짜 (YYYY-MM-DD)
 * @returns {Object} 일일 영양 분석 결과
 */
async function analyzeDailyNutrition(clientId, date) {
  const targetDate = new Date(date);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // 해당 날짜의 모든 식단 조회
  const meals = await Meal.findAll({
    where: {
      client_id: clientId,
      meal_date: {
        [Op.gte]: targetDate,
        [Op.lt]: nextDate
      }
    },
    include: [{ model: Nutrition }],
    order: [['meal_time', 'ASC']]
  });

  // 고객 정보 조회
  const client = await Client.findByPk(clientId);

  // 영양소 합계 계산
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0
  };

  meals.forEach((meal) => {
    totals.calories += meal.total_calories || 0;
    if (meal.Nutrition) {
      totals.protein += meal.Nutrition.protein || 0;
      totals.carbohydrates += meal.Nutrition.carbohydrates || 0;
      totals.fat += meal.Nutrition.fat || 0;
      totals.fiber += meal.Nutrition.fiber || 0;
    }
  });

  // 권장 섭취량 계산
  const recommendations = calculateRecommendedIntake(client);

  // 달성률 계산
  const achievement = {
    calories: calculatePercentage(totals.calories, recommendations.calories),
    protein: calculatePercentage(totals.protein, recommendations.protein),
    carbohydrates: calculatePercentage(totals.carbohydrates, recommendations.carbohydrates),
    fat: calculatePercentage(totals.fat, recommendations.fat),
    fiber: calculatePercentage(totals.fiber, recommendations.fiber)
  };

  // 부족/과잉 판단
  const status = {
    calories: getStatus(achievement.calories),
    protein: getStatus(achievement.protein),
    carbohydrates: getStatus(achievement.carbohydrates),
    fat: getStatus(achievement.fat),
    fiber: getStatus(achievement.fiber)
  };

  return {
    date: targetDate,
    mealCount: meals.length,
    totals,
    recommendations,
    achievement,
    status,
    meals: meals.map((m) => ({
      id: m.id,
      mealType: m.meal_type,
      mealTime: m.meal_time,
      calories: m.total_calories,
      nutrition: m.Nutrition
    }))
  };
}

/**
 * 기간별 영양 추세 분석
 * @param {number} clientId - 고객 ID
 * @param {string} startDate - 시작 날짜
 * @param {string} endDate - 종료 날짜
 * @returns {Object} 기간별 추세 분석 결과
 */
async function analyzeTrend(clientId, startDate, endDate) {
  const meals = await Meal.findAll({
    where: {
      client_id: clientId,
      meal_date: {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      }
    },
    include: [{ model: Nutrition }],
    order: [['meal_date', 'ASC']]
  });

  const client = await Client.findByPk(clientId);
  const recommendations = calculateRecommendedIntake(client);

  // 일별 데이터 그룹화
  const dailyData = {};

  meals.forEach((meal) => {
    const dateKey = meal.meal_date.toISOString().split('T')[0];

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        mealCount: 0,
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0
      };
    }

    dailyData[dateKey].mealCount++;
    dailyData[dateKey].calories += meal.total_calories || 0;

    if (meal.Nutrition) {
      dailyData[dateKey].protein += meal.Nutrition.protein || 0;
      dailyData[dateKey].carbohydrates += meal.Nutrition.carbohydrates || 0;
      dailyData[dateKey].fat += meal.Nutrition.fat || 0;
      dailyData[dateKey].fiber += meal.Nutrition.fiber || 0;
    }
  });

  const dailyArray = Object.values(dailyData);

  // 전체 평균 계산
  const averages = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0
  };

  if (dailyArray.length > 0) {
    dailyArray.forEach((day) => {
      averages.calories += day.calories;
      averages.protein += day.protein;
      averages.carbohydrates += day.carbohydrates;
      averages.fat += day.fat;
      averages.fiber += day.fiber;
    });

    const dayCount = dailyArray.length;
    averages.calories = Math.round(averages.calories / dayCount);
    averages.protein = Math.round((averages.protein / dayCount) * 10) / 10;
    averages.carbohydrates = Math.round((averages.carbohydrates / dayCount) * 10) / 10;
    averages.fat = Math.round((averages.fat / dayCount) * 10) / 10;
    averages.fiber = Math.round((averages.fiber / dayCount) * 10) / 10;
  }

  // 평균 달성률
  const averageAchievement = {
    calories: calculatePercentage(averages.calories, recommendations.calories),
    protein: calculatePercentage(averages.protein, recommendations.protein),
    carbohydrates: calculatePercentage(averages.carbohydrates, recommendations.carbohydrates),
    fat: calculatePercentage(averages.fat, recommendations.fat),
    fiber: calculatePercentage(averages.fiber, recommendations.fiber)
  };

  // 일관성 평가 (표준편차)
  const consistency = calculateConsistency(dailyArray, averages);

  return {
    period: {
      start: startDate,
      end: endDate,
      days: dailyArray.length
    },
    averages,
    recommendations,
    averageAchievement,
    consistency,
    dailyData: dailyArray
  };
}

/**
 * 목표 기반 권장 섭취량 계산 (Harris-Benedict 공식)
 * @param {Object} client - 고객 정보
 * @returns {Object} 권장 섭취량
 */
function calculateRecommendedIntake(client) {
  if (!client) {
    return getDefaultRecommendations();
  }

  // BMR (Basal Metabolic Rate) 계산 - Harris-Benedict 공식
  let bmr;
  if (client.gender === 'male') {
    bmr = 88.362 + 13.397 * client.weight + 4.799 * client.height - 5.677 * client.age;
  } else {
    bmr = 447.593 + 9.247 * client.weight + 3.098 * client.height - 4.330 * client.age;
  }

  // 활동 수준에 따른 계수
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  const activityMultiplier = activityMultipliers[client.activity_level] || 1.55;
  let tdee = bmr * activityMultiplier; // Total Daily Energy Expenditure

  // 목표에 따른 칼로리 조정
  if (client.goal === 'weight_loss') {
    tdee -= 500; // 1주일에 약 0.5kg 감량
  } else if (client.goal === 'muscle_gain') {
    tdee += 300; // 근육 증가를 위한 잉여 칼로리
  }

  // 거대 영양소 배분 (목표별)
  let proteinPercentage, carbPercentage, fatPercentage;

  if (client.goal === 'weight_loss') {
    proteinPercentage = 0.35; // 35%
    carbPercentage = 0.40;    // 40%
    fatPercentage = 0.25;     // 25%
  } else if (client.goal === 'muscle_gain') {
    proteinPercentage = 0.30; // 30%
    carbPercentage = 0.45;    // 45%
    fatPercentage = 0.25;     // 25%
  } else {
    // maintenance
    proteinPercentage = 0.25; // 25%
    carbPercentage = 0.50;    // 50%
    fatPercentage = 0.25;     // 25%
  }

  // g 단위로 계산 (protein: 4kcal/g, carb: 4kcal/g, fat: 9kcal/g)
  const protein = Math.round((tdee * proteinPercentage) / 4);
  const carbohydrates = Math.round((tdee * carbPercentage) / 4);
  const fat = Math.round((tdee * fatPercentage) / 9);

  // 식이섬유 권장량 (14g per 1000kcal)
  const fiber = Math.round((tdee / 1000) * 14);

  return {
    calories: Math.round(tdee),
    protein,
    carbohydrates,
    fat,
    fiber
  };
}

/**
 * 영양 상태 평가
 * @param {number} clientId - 고객 ID
 * @param {string} startDate - 시작 날짜
 * @param {string} endDate - 종료 날짜
 * @returns {Object} 영양 상태 평가 결과
 */
async function evaluateNutritionalStatus(clientId, startDate, endDate) {
  const trendData = await analyzeTrend(clientId, startDate, endDate);
  const client = await Client.findByPk(clientId);

  // 부족/과잉 영양소 식별
  const deficiencies = [];
  const excesses = [];

  Object.entries(trendData.averageAchievement).forEach(([nutrient, percentage]) => {
    if (percentage < 80) {
      deficiencies.push({
        nutrient,
        achievement: percentage,
        shortage: Math.round(
          trendData.recommendations[nutrient] - trendData.averages[nutrient]
        )
      });
    } else if (percentage > 120) {
      excesses.push({
        nutrient,
        achievement: percentage,
        excess: Math.round(
          trendData.averages[nutrient] - trendData.recommendations[nutrient]
        )
      });
    }
  });

  // 개선 제안 생성
  const suggestions = generateSuggestions(deficiencies, excesses, client);

  // 전반적인 점수 (0-100)
  const overallScore = calculateNutritionalScore(trendData.averageAchievement, trendData.consistency);

  return {
    period: trendData.period,
    client: {
      id: client.id,
      name: client.name,
      goal: client.goal
    },
    overallScore,
    averages: trendData.averages,
    recommendations: trendData.recommendations,
    achievement: trendData.averageAchievement,
    consistency: trendData.consistency,
    deficiencies,
    excesses,
    suggestions
  };
}

// ========== 헬퍼 함수 ==========

function calculatePercentage(actual, target) {
  if (!target || target === 0) return 0;
  return Math.round((actual / target) * 100);
}

function getStatus(percentage) {
  if (percentage < 80) return 'insufficient';
  if (percentage > 120) return 'excessive';
  return 'adequate';
}

function getDefaultRecommendations() {
  return {
    calories: 2000,
    protein: 50,
    carbohydrates: 250,
    fat: 55,
    fiber: 28
  };
}

function calculateConsistency(dailyArray, averages) {
  if (dailyArray.length < 2) {
    return {
      calories: 100,
      protein: 100,
      carbohydrates: 100,
      fat: 100,
      fiber: 100
    };
  }

  const variance = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0
  };

  // 분산 계산
  dailyArray.forEach((day) => {
    variance.calories += Math.pow(day.calories - averages.calories, 2);
    variance.protein += Math.pow(day.protein - averages.protein, 2);
    variance.carbohydrates += Math.pow(day.carbohydrates - averages.carbohydrates, 2);
    variance.fat += Math.pow(day.fat - averages.fat, 2);
    variance.fiber += Math.pow(day.fiber - averages.fiber, 2);
  });

  const n = dailyArray.length;

  // 표준편차
  const stdDev = {
    calories: Math.sqrt(variance.calories / n),
    protein: Math.sqrt(variance.protein / n),
    carbohydrates: Math.sqrt(variance.carbohydrates / n),
    fat: Math.sqrt(variance.fat / n),
    fiber: Math.sqrt(variance.fiber / n)
  };

  // 변동계수 (CV) - 낮을수록 일관성 높음
  const cv = {
    calories: averages.calories > 0 ? (stdDev.calories / averages.calories) * 100 : 0,
    protein: averages.protein > 0 ? (stdDev.protein / averages.protein) * 100 : 0,
    carbohydrates: averages.carbohydrates > 0 ? (stdDev.carbohydrates / averages.carbohydrates) * 100 : 0,
    fat: averages.fat > 0 ? (stdDev.fat / averages.fat) * 100 : 0,
    fiber: averages.fiber > 0 ? (stdDev.fiber / averages.fiber) * 100 : 0
  };

  // 일관성 점수 (CV를 역으로 변환, 100점 만점)
  const consistency = {
    calories: Math.max(0, Math.min(100, 100 - cv.calories)),
    protein: Math.max(0, Math.min(100, 100 - cv.protein)),
    carbohydrates: Math.max(0, Math.min(100, 100 - cv.carbohydrates)),
    fat: Math.max(0, Math.min(100, 100 - cv.fat)),
    fiber: Math.max(0, Math.min(100, 100 - cv.fiber))
  };

  return {
    calories: Math.round(consistency.calories),
    protein: Math.round(consistency.protein),
    carbohydrates: Math.round(consistency.carbohydrates),
    fat: Math.round(consistency.fat),
    fiber: Math.round(consistency.fiber)
  };
}

function generateSuggestions(deficiencies, excesses, client) {
  const suggestions = [];

  deficiencies.forEach(({ nutrient, shortage }) => {
    let suggestion = '';
    switch (nutrient) {
      case 'protein':
        suggestion = `단백질 섭취량이 부족합니다. 하루 ${shortage}g 더 섭취하세요. 추천: 닭가슴살, 생선, 계란, 콩류`;
        break;
      case 'carbohydrates':
        suggestion = `탄수화물 섭취량이 부족합니다. 하루 ${shortage}g 더 섭취하세요. 추천: 현미, 고구마, 통곡물`;
        break;
      case 'fat':
        suggestion = `지방 섭취량이 부족합니다. 하루 ${shortage}g 더 섭취하세요. 추천: 견과류, 아보카도, 올리브오일`;
        break;
      case 'fiber':
        suggestion = `식이섬유 섭취량이 부족합니다. 하루 ${shortage}g 더 섭취하세요. 추천: 채소, 과일, 통곡물`;
        break;
      case 'calories':
        suggestion = `칼로리 섭취량이 부족합니다. 하루 ${shortage}kcal 더 섭취하세요.`;
        break;
    }
    suggestions.push({ type: 'deficiency', nutrient, suggestion });
  });

  excesses.forEach(({ nutrient, excess }) => {
    let suggestion = '';
    switch (nutrient) {
      case 'protein':
        suggestion = `단백질 섭취량이 과다합니다. 하루 ${excess}g 줄이세요.`;
        break;
      case 'carbohydrates':
        suggestion = `탄수화물 섭취량이 과다합니다. 하루 ${excess}g 줄이세요. 가공 탄수화물을 줄이고 통곡물로 대체하세요.`;
        break;
      case 'fat':
        suggestion = `지방 섭취량이 과다합니다. 하루 ${excess}g 줄이세요. 포화지방과 트랜스지방을 줄이세요.`;
        break;
      case 'calories':
        if (client.goal !== 'muscle_gain') {
          suggestion = `칼로리 섭취량이 과다합니다. 하루 ${excess}kcal 줄이세요.`;
        }
        break;
    }
    if (suggestion) {
      suggestions.push({ type: 'excess', nutrient, suggestion });
    }
  });

  // 목표 기반 추가 제안
  if (client.goal === 'weight_loss') {
    suggestions.push({
      type: 'goal',
      nutrient: 'general',
      suggestion: '체중 감량 목표: 고단백 저탄수화물 식단을 유지하고, 식사 시간을 규칙적으로 하세요.'
    });
  } else if (client.goal === 'muscle_gain') {
    suggestions.push({
      type: 'goal',
      nutrient: 'general',
      suggestion: '근육 증가 목표: 운동 후 30분 내 단백질 섭취를 하고, 충분한 칼로리를 유지하세요.'
    });
  }

  return suggestions;
}

function calculateNutritionalScore(achievement, consistency) {
  // 달성률 점수 (80-120% 범위에 있으면 높은 점수)
  let achievementScore = 0;
  let nutrientCount = 0;

  Object.values(achievement).forEach((percentage) => {
    nutrientCount++;
    if (percentage >= 80 && percentage <= 120) {
      achievementScore += 20; // 적정 범위
    } else if (percentage >= 70 && percentage < 80) {
      achievementScore += 15; // 약간 부족
    } else if (percentage > 120 && percentage <= 130) {
      achievementScore += 15; // 약간 과다
    } else if (percentage >= 60 && percentage < 70) {
      achievementScore += 10; // 부족
    } else if (percentage > 130 && percentage <= 150) {
      achievementScore += 10; // 과다
    } else {
      achievementScore += 5; // 매우 부족 또는 매우 과다
    }
  });

  const maxAchievementScore = nutrientCount * 20;
  const achievementPercentage = (achievementScore / maxAchievementScore) * 60; // 60% 가중치

  // 일관성 점수
  const avgConsistency =
    Object.values(consistency).reduce((sum, val) => sum + val, 0) / Object.values(consistency).length;
  const consistencyPercentage = (avgConsistency / 100) * 40; // 40% 가중치

  return Math.round(achievementPercentage + consistencyPercentage);
}

module.exports = {
  analyzeDailyNutrition,
  analyzeTrend,
  calculateRecommendedIntake,
  evaluateNutritionalStatus
};
