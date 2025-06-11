const fs = require('fs');
/*
let content = JSON.parse(fs.readFileSync('info.json', 'utf8'));
content = content.map(item => {
    if(item.endsWith("s")) {
        return item.slice(0, -1);
    } else {
        return item;
    }
})
fs.writeFileSync('test.txt', content.join('\n'));

let colleges = [];
for(let i = 15; i<=78; i+=3) {
    let remainingColleges = true;
    let x = 1;
    while(remainingColleges) {
        let college = document.querySelector(`#mw-content-text > div.mw-content-ltr.mw-parser-output > div:nth-child(${i}) > ul > li:nth-child(${x}) > a`)
        if(college) {
            colleges.push(college.innerText);
            x++;
        } else {
            remainingColleges = false;
        }
    }
}
    
let cityData = fs.readFileSync('cityData.txt', 'utf8').split("\n");
const codes = JSON.parse(fs.readFileSync('stateCodes.json', 'utf8'));
cityData = cityData.map(item => {
    return item.split(",")[1] + ", " + codes[item.split(",")[2]]
})
fs.appendFileSync("info.json", JSON.stringify(cityData));
console.log(cityData);
*/
/*
let content = JSON.parse(fs.readFileSync('info.json', 'utf8'));
content = content.map(item => {
    if(item.endsWith("s")) {
        return item.slice(0, -1);
    } else {
        return item;
    }
})
fs.writeFileSync('test.txt', content.join('\n'));*/
const data = fs.readFileSync('test.txt', 'utf8').split("\n");
fs.writeFileSync('info.json', JSON.stringify(data));