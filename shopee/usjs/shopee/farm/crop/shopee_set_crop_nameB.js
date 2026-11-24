const cropNameS = '天天種簽到樹;簽到樹送道具;天天種;天天抽;免運券;週末驚喜發財樹;蝦幣黃金樹;電視頻道餐一個月'; // 用 ; 區隔，名稱越完整不容易錯
//const cropNameI = '1;1;1;1';
$persistentStore.write(cropNameS, 'ShopeeCropNameSB');
$persistentStore.write(null, 'ShopeeCropNameIB');

console.log('成功設定 次要種子 : \n' + cropNameS + ' ✅');
$done({});
