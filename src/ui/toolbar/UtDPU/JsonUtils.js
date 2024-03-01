function GetErrorCode(jsonString_) {
    let obj;
    try {
        obj = JSON.parse(jsonString_);
    } catch (e) {
        return -1;
    }

    if (obj && obj.error && obj.error.code) {
        return obj.error.code;
    } else {
        return 0;
    }
}