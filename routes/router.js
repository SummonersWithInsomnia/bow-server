const express = require('express');
const PostLoginAdmin = require("../controllers/admin/PostLoginAdmin");
const GetCourses = require("../controllers/course/GetCourses");
const PostLoginStudent = require("../controllers/student/PostLoginStudent");
const PostSignupStudent = require("../controllers/student/PostSignupStudent");
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send("It works");
});

router.get('/courses', (req, res, next) => {
    // GetCourses(req, res);
});

router.get('/dashboard', (req, res, next) => {
});

router.get('/profile', (req, res, next) => {
});

router.get('/user', (req, res, next) => {
});

router.get('/tickets', (req, res, next) => {
});

router.get('/student-list', (req, res, next) => {
});

router.get('/student-list-by-course', (req, res, next) => {
});

router.get('/my-courses', (req, res, next) => {
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
});

router.post('/create-course', (req, res, next) => {
});

router.post('/register-course', (req, res, next) => {
});

router.put('/profile', (req, res, next) => {
});

router.put('/course', (req, res, next) => {
});

router.delete('/course', (req, res, next) => {
});

router.delete('/drop-course', (req, res, next) => {
});

router.all('*', (req, res, next) => {
    res.status(404).send("404 Not Found");
});

module.exports = router;