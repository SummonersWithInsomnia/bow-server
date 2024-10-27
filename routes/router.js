const express = require('express');
const PostLoginAdmin = require("../controllers/admin/PostLoginAdmin");
const PostSearchCourses = require("../controllers/course/PostSearchCourses");
const PostLoginStudent = require("../controllers/student/PostLoginStudent");
const PostSignupStudent = require("../controllers/student/PostSignupStudent");
const GetDashboard = require("../controllers/dashboard/GetDashboard");
const GetProfile = require("../controllers/profile/GetProfile");
const PutProfile = require("../controllers/profile/PutProfile");
const GetUserInfo = require("../controllers/user/GetUserInfo");
const GetTickets = require("../controllers/ticket/GetTickets");
const GetMyCourses = require("../controllers/course-registration/GetMyCourses");
const PostSearchStudentList = require("../controllers/student/PostSearchStudentList");
const PostSearchStudentListByCourse = require("../controllers/student/PostSearchStudentListByCourse");
const PostSendTicket = require("../controllers/ticket/PostSendTicket");
const DeleteCourse = require("../controllers/course/DeleteCourse");
const DeleteDropCourse = require("../controllers/course-registration/DeleteDropCourse");
const PutCourse = require("../controllers/course/PutCourse");
const PostRegisterCourse = require("../controllers/course-registration/PostRegisterCourse");
const PostCreateCourse = require("../controllers/course/PostCreateCourse");
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send("It works");
});

router.post('/courses', (req, res, next) => {
    PostSearchCourses(req, res);
});

router.get('/dashboard', (req, res, next) => {
    GetDashboard(req, res);
});

router.get('/profile', (req, res, next) => {
    GetProfile(req, res);
});

router.get('/user', (req, res, next) => {
    GetUserInfo(req, res);
});

router.get('/tickets', (req, res, next) => {
    GetTickets(req, res);
});

router.post('/student-list', (req, res, next) => {
    PostSearchStudentList(req, res);
});

router.post('/student-list-by-course', (req, res, next) => {
    PostSearchStudentListByCourse(req, res);
});

router.get('/my-courses', (req, res, next) => {
    GetMyCourses(req, res);
});

router.post('/login-student', (req, res, next) => {
    PostLoginStudent(req, res);
});

router.post('/login-admin', (req, res, next) => {
    PostLoginAdmin(req, res);
});

router.post('/signup-student', (req, res, next) => {
    PostSignupStudent(req, res);
});

router.post('/send-ticket', (req, res, next) => {
    PostSendTicket(req, res);
});

router.post('/create-course', (req, res, next) => {
    PostCreateCourse(req, res);
});

router.post('/register-course', (req, res, next) => {
    PostRegisterCourse(req, res);
});

router.put('/profile', (req, res, next) => {
    PutProfile(req, res);
});

router.put('/course', (req, res, next) => {
    PutCourse(req, res);
});

router.delete('/course', (req, res, next) => {
    DeleteCourse(req, res);
});

router.delete('/drop-course', (req, res, next) => {
    DeleteDropCourse(req, res);
});

router.all('*', (req, res, next) => {
    res.status(404).send("404 Not Found");
});

module.exports = router;