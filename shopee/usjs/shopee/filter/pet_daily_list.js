const version = 'v20240430';

try {

    let body = $response.body;
    var obj = JSON.parse(body);
    // console.log(obj.data);
    if (obj.code == 0 && 'dailyTasks' in obj.data) {
        let found32 = obj.data.dailyTasks.some(t => { if (t.taskType == 1 && (t.taskID == 32)) { return true; } });
        // let found37 = obj.data.dailyTasks.some(t => { if (t.taskType == 1 && t.taskID == 37) { return true; } });
        // if (!found37) {
        //     console.log('Add dailyTasks 37');

        //     obj.data.dailyTasks.push({
        //         "isClaimed": false,
        //         "taskID": 37,
        //         "taskType": 1,
        //         "progress": 0
        //     });
        // }
        if (!found32) {
            console.log('Add dailyTasks 32');

            obj.data.dailyTasks.push({
                "isClaimed": false,
                "taskID": 32,
                "taskType": 1,
                "progress": 0
            });
        }

        body = JSON.stringify(obj);
    } else {
        console.log('NotDailyTasks');
    }
    $done({ body });
} catch (error) {
    console.log('ERR:');
    console.log(error);
    $done({});
}
