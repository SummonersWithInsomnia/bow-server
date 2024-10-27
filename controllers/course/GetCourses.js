const mgc = require("../../mgc/mgc");
const course = require("../../models/course");

async function GetCourses(req, res) {
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

    safeOtherQueryItems.deleted = false;

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

    let resultData = await mgc.findRecords(course, safeNameAndCodeQueryItems, course.find);
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

module.exports = GetCourses;