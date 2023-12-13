const accessCheck = require('./accessCheck');
const ReleaseDateNo1 = 45267; // 2023/12/7
const ReleaseDateNo2 = ReleaseDateNo1+7; // 2023/12/14

accessCheck(ReleaseDateNo1, 1, 1000, "result01.txt");