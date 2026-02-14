require('dotenv').config({ path: '.env.test' });
const { calculateRecommendedIntake } = require('../src/services/nutritionService');

describe('Nutrition Service', () => {
  describe('calculateRecommendedIntake', () => {
    it('should calculate BMR and TDEE for male weight loss', () => {
      const client = {
        gender: 'male',
        age: 30,
        height: 175,
        weight: 80,
        activity_level: 'moderate',
        goal: 'weight_loss'
      };

      const result = calculateRecommendedIntake(client);

      expect(result).toHaveProperty('calories');
      expect(result).toHaveProperty('protein');
      expect(result).toHaveProperty('carbohydrates');
      expect(result).toHaveProperty('fat');
      expect(result).toHaveProperty('fiber');

      // 체중 감량은 TDEE에서 500 감소
      expect(result.calories).toBeGreaterThan(0);
      expect(result.calories).toBeLessThan(3000);
      
      // 단백질 비율 확인 (35%)
      expect(result.protein).toBeGreaterThan(0);
    });

    it('should calculate for female muscle gain', () => {
      const client = {
        gender: 'female',
        age: 25,
        height: 160,
        weight: 55,
        activity_level: 'active',
        goal: 'muscle_gain'
      };

      const result = calculateRecommendedIntake(client);

      // 근육 증가는 TDEE에서 300 증가
      expect(result.calories).toBeGreaterThan(0);
      expect(result.protein).toBeGreaterThan(0);
      expect(result.carbohydrates).toBeGreaterThan(0);
    });

    it('should calculate for maintenance goal', () => {
      const client = {
        gender: 'male',
        age: 35,
        height: 170,
        weight: 70,
        activity_level: 'light',
        goal: 'maintenance'
      };

      const result = calculateRecommendedIntake(client);

      // 유지는 TDEE 그대로
      expect(result.calories).toBeGreaterThan(0);
      
      // 영양소 비율: 단백질 25%, 탄수화물 50%, 지방 25%
      const proteinCalories = result.protein * 4;
      const carbCalories = result.carbohydrates * 4;
      const fatCalories = result.fat * 9;
      const totalCalories = proteinCalories + carbCalories + fatCalories;

      // 합계가 목표 칼로리와 유사한지 확인 (±100kcal)
      expect(Math.abs(totalCalories - result.calories)).toBeLessThan(100);
    });

    it('should return default recommendations for null client', () => {
      const result = calculateRecommendedIntake(null);

      expect(result).toEqual({
        calories: 2000,
        protein: 50,
        carbohydrates: 250,
        fat: 55,
        fiber: 28
      });
    });

    it('should calculate fiber based on calories', () => {
      const client = {
        gender: 'male',
        age: 30,
        height: 175,
        weight: 70,
        activity_level: 'moderate',
        goal: 'maintenance'
      };

      const result = calculateRecommendedIntake(client);

      // 식이섬유: 14g per 1000kcal
      const expectedFiber = Math.round((result.calories / 1000) * 14);
      expect(result.fiber).toBe(expectedFiber);
    });

    it('should handle sedentary activity level', () => {
      const client = {
        gender: 'female',
        age: 40,
        height: 165,
        weight: 60,
        activity_level: 'sedentary',
        goal: 'maintenance'
      };

      const result = calculateRecommendedIntake(client);

      // Sedentary는 가장 낮은 활동 계수 (1.2)
      expect(result.calories).toBeGreaterThan(0);
      expect(result.calories).toBeLessThan(2500);
    });

    it('should handle very active level', () => {
      const client = {
        gender: 'male',
        age: 25,
        height: 180,
        weight: 75,
        activity_level: 'very_active',
        goal: 'maintenance'
      };

      const result = calculateRecommendedIntake(client);

      // Very active는 가장 높은 활동 계수 (1.9)
      expect(result.calories).toBeGreaterThan(2500);
    });
  });
});
