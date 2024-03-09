function getFoodData(seasonString) {
    const httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = () => {
        if(this.readState == 4 && this.status == 200) {
            //
        }
    };

    httpReq.open("GET", "/listItems", true);
    const reqObject = {
        'season': seasonString
    };
    httpReq.send(JSON.stringify(reqObject));
}