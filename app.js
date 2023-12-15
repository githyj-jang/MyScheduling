const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cookieParser = require('cookie-parser');

const app = express();

const USER_COOKIE_KEY = 'USER';
const USERS_JSON_FILENAME = 'users.json';
const DATA_JSON_FILENAME = 'data.json';
const NOTICE_JSON_FILENAME = 'notice.json';
async function fetchAllUsers() {
    const data = await fs.readFile(USERS_JSON_FILENAME);
    const users = JSON.parse(data.toString());
    return users;
}

async function fetchUser(username) {
    const users = await fetchAllUsers();
    const user = users.find((user) => user.username === username);
    return user;
}

async function createUser(newUser) {
    const users = await fetchAllUsers();
    users.push(newUser);
    await fs.writeFile(USERS_JSON_FILENAME, JSON.stringify(users));
}

async function fetchAllmeal() {
    const data = await fs.readFile(DATA_JSON_FILENAME);
    const meals = JSON.parse(data);
    return meals;
}
async function createMeal(newMeal) {
    const meals = await fetchAllmeal();
    meals.push(newMeal);
    await fs.writeFile(DATA_JSON_FILENAME, JSON.stringify(meals));
}

async function fetchAllnotice() {
    const data = await fs.readFile(NOTICE_JSON_FILENAME);
    const notices = JSON.parse(data);
    return notices;
}
async function createNotice(newNotice) {
    const notices = await fetchAllnotice();
    notices.push(newNotice);
    await fs.writeFile(NOTICE_JSON_FILENAME, JSON.stringify(notices));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/signup', async (req, res) => {
    const { username, name, password } = req.body;
    const user = await fetchUser(username);

    if (user) {
        res.status(400).json({ error: '이미 존재하는 사용자입니다.' });
        return;
    }

    // 아직 가입되지 않은 username인 경우 db에 저장
    // KEY = username, VALUE = { name, password }
    const newUser = {
        username,
        name,
        password,
    };
    await createUser({
        username,
        name,
        password,
    });

    // db에 저장된 user 객체를 문자열 형태로 변환하여 쿠키에 저장
    res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser));
    // 가입 완료 후, 루트 페이지로 이동
    res.redirect('/');
});



app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await fetchUser(username);

    // 가입 안 된 username인 경우
    if (!user) {
        res.status(400).json({ error: '가입되지 않은 사용자입니다.' });
        return;
    }
    // 비밀번호가 틀렸을 경우
    if (password !== user.password) {
        res.status(400).json({ error: '비밀번호가 올바르지 않습니다.' });
        return;
    }

    // db에 저장된 user 객체를 문자열 형태로 변환하여 쿠키에 저장
    res.cookie(USER_COOKIE_KEY, JSON.stringify(user));
    // 로그인(쿠키 발급) 후, 루트 페이지로 이동
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    // 쿠키 삭제 후 루트 페이지로 이동
    res.clearCookie(USER_COOKIE_KEY);
    res.redirect('/');
});

app.post('/dataup',async (req, res) => {
    const { mealtime,mealmoment, mealname, mealenergy, mealprotein, mealFiber, mealfolicacid, mealcalcium, mealsalt, mealiron, mealzinc } = req.body;

    const user = JSON.parse(req.cookies[USER_COOKIE_KEY]);

    await createMeal({
        username: user.username, mealtime,mealmoment, mealname, mealenergy, mealprotein, mealFiber, mealfolicacid, mealcalcium, mealsalt, mealiron, mealzinc
    });

    res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

app.post('/dataResult',async (req, res) => {
    const selectedDate = req.body.selectedDate;
    const meals = await fetchAllmeal();
    const user = JSON.parse(req.cookies[USER_COOKIE_KEY]);
    const filteredMeals = meals.filter(meals => user.username === meals.username, meals.mealtime === selectedDate);
    res.json(filteredMeals);
});

app.post('/noticepost',async (req, res) => {
    const subject = req.body.subject;
    const content = req.body.content;

    await createNotice({
        subject,content
    });

    res.sendFile(path.join(__dirname, 'public', 'notice_board.html'));
});

app.listen(3000, () => {
    console.log('server is running at 3000');
});

/*
// 모듈을 추출합니다.
const express = require('express');
var router = express.Router();
const path = require('path');2
const cookieParser = require('cookie-parser');
const fs = require('fs').promises;

// 서버를 생성/실행합니다.
const app = express();

const USER_COOKIE_KEY = 'USER';
const USERS_JSON_FILENAME = 'users.json';

async function fetchAllUsers() {
    const data = await fs.readFile(USERS_JSON_FILENAME);
    const users = JSON.parse(data.toString());
    return users;
}

async function fetchUser(username) {
    const users = await fetchAllUsers();
    const user = users.find((user) => user.username === username);
    return user;
}

async function createUser(newUser) {
    const users = await fetchAllUsers();
    users.push(newUser);
    await fs.writeFile(USERS_JSON_FILENAME, JSON.stringify(users));
}


// 미들웨어를 추가합니다.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: false
}))
app.use(cookieParser());

app.get('/', async (req,res)=>{
    const userCookie = req.cookies[USER_COOKIE_KEY];
    
    if (userCookie) {
        // 쿠키가 존재하는 경우, 쿠키 VALUE를 JS 객체로 변환
        const userData = JSON.parse(userCookie);
        // user 객체에 저장된 username이 db에 존재하는 경우,
        // 유효한 user이며 로그인이 잘 되어 있다는 뜻.
        const user = await fetchUser(userData.username);
        
        if (user) {
            // JS 객체로 변환된 user 데이터에서 username, name, password를 추출하여 클라이언트에 렌더링
            res.sendFile(__dirname+'index_login.html')
        }
    }
    else{
        res.sendFile(__dirname+'index.html')
    }
    
});


app.post('/signup', async (req, res) => {
    const { username, name, password } = req.body;
    const user = await fetchUser(username);

    // 이미 존재하는 username일 경우 회원 가입 실패
    if (user) {
        res.status(400).send(`duplicate username: ${username}`);
        return;
    }

    if (username == 0 || name== 0 || password == 0 ){
        res.status(400).send(`duplicate username: ${username}`);
        return;
    }

    // 아직 가입되지 않은 username인 경우 db에 저장
    // KEY = username, VALUE = { name, password }
    const newUser = {
        username,
        name,
        password,
    };
    await createUser({
        username,
        name,
        password,
    });

    // db에 저장된 user 객체를 문자열 형태로 변환하여 쿠키에 저장
    res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser));
    // 가입 완료 후, 루트 페이지로 이동
    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await fetchUser(username);

    // 가입 안 된 username인 경우
    if (!user) {
        res.status(400).send(`duplicate
        `);
        return;
    }
    // 비밀번호가 틀렸을 경우
    if (password !== user.password) {
        res.status(400).send(`
        `);
        return;
    }

    // db에 저장된 user 객체를 문자열 형태로 변환하여 쿠키에 저장
    res.cookie(USER_COOKIE_KEY, JSON.stringify(user));
    // 로그인(쿠키 발급) 후, 루트 페이지로 이동
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    // 쿠키 삭제 후 루트 페이지로 이동
    res.clearCookie(USER_COOKIE_KEY);
    res.redirect('/');
});


app.listen(52273, () => {
    console.log('Server Running at http://127.0.0.1:52273');
});
*/