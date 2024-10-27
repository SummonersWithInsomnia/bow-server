const mgc = require("../../mgc/mgc");
const course = require("../../models/course");

async function PostSearchCourses(req, res) {
    if (Object.keys(req.body).length === 0) {
        let courseData = await mgc.findRecords(course, {"deleted": false}, course.find);
        res.status(200).send({
            "status": 200,
            "message": "OK",
            "data": courseData
        });
        return;
    }

    let limitedNameAndCodeQueryItems = {
        name: req.body.name,
        code: req.body.code
    };

    let limitedOtherQueryItems = {
        id: req.body.id,
        department: req.body.department,
        program: req.body.program,
        term: req.body.term
    };

    let safeNameAndCodeQueryItems = {};
    let safeOtherQueryItems = {};


    for (let [key, value] of Object.entries(limitedNameAndCodeQueryItems)) {
        if (limitedNameAndCodeQueryItems[key] !== "" && limitedNameAndCodeQueryItems[key] !== undefined) {
            safeNameAndCodeQueryItems[key] = value;
        }
    }

    for (let [key, value] of Object.entries(limitedOtherQueryItems)) {
        if (limitedOtherQueryItems[key] !== "" && limitedOtherQueryItems[key] !== undefined) {
            safeOtherQueryItems[key] = value;
        }
    }

    safeOtherQueryItems.deleted = false;

    let resultData = await mgc.findRecords(course, safeOtherQueryItems, course.find);

    if (resultData === null) {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
        return;
    }

    let optimisedResultData = [];

    for (let i = 0; i < resultData.length; i++) {
        for (let [key, value] of Object.entries(safeNameAndCodeQueryItems)) {
            if (resultData[i][key].toLowerCase().includes(value.toLowerCase())) {
                if (!optimisedResultData.some(item => item.id === resultData[i].id)) {
                    optimisedResultData.push(resultData[i]);
                }
            }
        }
    }

    if (optimisedResultData.length === 0 && Object.keys(safeNameAndCodeQueryItems).length === 0) {
        optimisedResultData = resultData;
    }

    res.status(200).send({
        "status": 200,
        "message": "OK",
        "data": optimisedResultData
    });
}

module.exports = PostSearchCourses;