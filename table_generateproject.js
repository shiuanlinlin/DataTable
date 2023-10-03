//全域json
let jsonDataTable =
{
    //只要欄位有多少就要寫多少 ex: t1~t6 就是六欄
    "theader": [
        { "data": "t1" },
        { "data": "t2" },
        { "data": "t3" },
        { "data": "t4" }
    ],
    //只要欄位有多少就要寫多少 ， 這是用來寫入th的內容
    "theader_name": [
        { "name": "表格1" },
        { "name": "表格2" },
        { "name": "表格3" },
        { "name": "表格4" }
    ],
    //列表顯示
    "tbody": [
        {
            "t1": "1",
            "t2": "2",
            "t3": "3",
            "t4": "4"
        },
        {
            "t1": "5",
            "t2": "6",
            "t3": "7",
            "t4": "8",
            "rowspan": 2, //直向合併格數，合併兩格輸入2
            "rowspan_index": 2,//從第幾格開始執行，例如 t2 合併 下一行的 t2
            "class": "text-left",//在合併的那格添加class,
            "rowspan_old": "10" //保留下一個被移除的欄位(下一個t2倍合併掉，所以這裡要寫原本t2的值)
        },
        {
            "t1": "9",
            "t2": "10",
            "t3": "11",
            "t4": "12"
        },
        {
            "t1": "13",
            "t2": "14",
            "t3": "15",
            "t4": "16"
        },
        {
            "t1": "17",
            "t2": "18",
            "t3": "19",
            "t4": "20",
            "colspan": 2,//橫向合併格數
            "colspan_index": 2,//從第幾格開始執行，例如 t2 合併 t3
            "class": "text-left",//在合併的那格添加class
            "colspan_old": "19" //保留下一個被移除的欄位(下一個t3倍合併掉，所以這裡要寫原本t3的值)
        }
    ]

};

//全域重新組成json
let newjson = {
    "theader": [],
    "theader_name": [],
    "tbody": []
};

//全域表格
let DataTableShow;

//測試生成次數
let demotest = 1;

//測試功能是否開啟
let demotest_start = false;


//頁籤
//1.生成表格
//TableDataShow(id,json,status);
//2.按鈕功能作用
//DataTableOtherButton(id);
//3.生成表頭
//TableAddFieldTheader(Table,target,thparents,thparent,liIndex);


$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: 'table.json',
        success: function(data) {
            //0.寫入全域
            jsonDataTable = data;
            //1.生成表格
            TableDataShow('table_id',data,'backend');
            //2.按鈕功能作用
            DataTableOtherButton('TableTool','table_id');
        },
        error: function(error) {
            console.log(error);
        },
    });
});


//生成表格(表格id、表格json、產生後台表格還是前台backend or frontend)
//前台生成與後台生成的差別在於 input顯示
//1.生成表格
function TableDataShow(id,json,status) {
    //1.表格id
    const table = $(`#${id}`);
    // 如果合併就以t1的資料為主
    let rowspan_num = 0; //rowspan是否還有要移除的欄位
    let rowspan_index = 0; //rowspan要從第幾格開始處理
    let colspan_num = 0; //colspan是否還有要移除的欄位
    let colspan_index = 0; //colspan要從第幾格開始處理

    //2.功能選單(後台用)
    let menuTool = `
        <div class="dropdown">
            <button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false">
                <img src="./img/ellipsis-vertical-solid.svg" class="dropdown_menuicon">
            </button>
            <div class="dropdown-menu">
                <button type="button" data-table="right_add" class="dropdown-item">
                    <img src="./img/right-long-solid.svg" class="dropdown_righticon" alt="向右新增一欄">
                    向右新增一欄
                </button>
                <button type="button" data-table="del_add" class="dropdown-item">
                    <img src="./img/xmark-solid.svg" class="dropdown_delicon" alt="移除此欄位">
                    移除此欄位
                </button>
            </div>
        </div>
    `;

    //3.先建立 thead
    //thead 產生
    let theader_json = json.theader_name;
    //let theader_length = theader_json.length;
    let theader_th = '';

    //建立內容
    theader_json.forEach(item => {
        if(status == 'backend')
        {
            theader_th += `
                <th><div class="backend_menu"><input type="text" value="${item.name}">${menuTool}</div></th>
            `;
        }
        if(status != 'backend')
        {
            theader_th += `
                <th>${item.name}</th>
            `;
        }

    });
    //組裝
    let theader_html = `
        <thead>
            <tr>
                ${theader_th}
            </tr>
        </thead>
    `;
    //4.放入table
    table.html(theader_html);

    //5.tbody產生( 搭配套件 DataTable )
    DataTableShow = $(`#${id}`).DataTable({
        data: json.tbody, //內容
        columns: json.theader, //標題
        searching: false, //搜尋
        paging: false, //分頁功能
        ordering: false, //排序
        info: false, //目前頁數的顯示
        //表格生成前處理
        'columnDefs': [{
            'targets': '_all', //設定要處理第幾行 ex: 'targets': 0 處理第一行
            'createdCell': function (td, cellData, rowData, row, col) {
                //後台生成給予input
                if(status == 'backend')
                {
                    $(td).html('<input type="text" value="' + cellData + '">');
                }
            },
        }],
        //產生畫面之後作用
        createdRow: function (row, data, dataIndex) {
            //抓到下一行表格要再處理，清除不必要的欄位
            if (rowspan_num != 0) {
                $(row).find(`td:eq(${rowspan_index})`).remove();
                //處理完成，不需要再處理縱列
                rowspan_num = rowspan_num - 1;
            }

            if (data.rowspan && data.rowspan > 1 && rowspan_num == 0) {
                //1.先設定合併的縱列有幾個，在下一個tr處理完後結束工作
                rowspan_num = data.rowspan - 1;
                //2.判斷是第幾列需要合併
                rowspan_index = data.rowspan_index - 1;
                //3.將規則寫上去
                $(row).find(`td:eq(${rowspan_index})`).attr('rowspan', data.rowspan);
                $(row).find(`td:eq(${rowspan_index})`).attr('rowspan_index', rowspan_index);
                $(row).find(`td:eq(${rowspan_index})`).attr('rowspan_old', data.rowspan_old);

                //4.如果有寫 class
                if (data.class) {
                    $(row).find(`td:eq(${rowspan_index})`).addClass(data.class);
                }

            }

            //橫向合併
            if (data.colspan && data.colspan > 1) {
                //1.取得有多少 child
                let td = row.children;
                //2.計算是第幾個要處理
                colspan_index = Number(data.colspan_index) - 1;

                //3.利用所有數量跑回圈
                for (let i = 0; i < td.length; i++) {
                    //5.如果有需要移除被合併的td或th
                    if (colspan_num != 0) {
                        $(row).find(`td:eq(${i})`).remove();
                        //每次處理都扣 1 ，表示該處理的已經完成
                        colspan_num = colspan_num - 1;
                    }

                    //找到需要設定的td或th
                    if (i == colspan_index) {
                        //計算有多少的td要移除
                        colspan_num = Number(data.colspan) - 1;
                        $(row).find(`td:eq(${i})`).attr('colspan', data.colspan);
                        $(row).find(`td:eq(${i})`).attr('colspan_index', data.colspan_index);
                        $(row).find(`td:eq(${i})`).attr('colspan_old', data.colspan_old);
                        //4.如果有寫 class
                        if (data.class) {
                            $(row).find(`td:eq(${i})`).addClass(data.class);
                        }
                    }

                }
            }

        }
    });
    //繪製
    DataTableShow.draw();
}

//2.按鈕功能作用
function DataTableOtherButton(id,tableid)
{
    const Table = document.getElementById(tableid);
    const TableBox = document.getElementById(id);
    if(TableBox)
    {
        TableBox.addEventListener('click', (event)=>{
            let target = event.target;
            let dataTable = ('table' in target.dataset ) ? target.dataset.table : false;
            switch(dataTable)
            {
                //產生json
                case "json":
                    break;
                //右邊新增一欄位
                case "right_add":
                    //(1.) 先取得目前所在欄位
                    let trparent = Table.querySelector('thead tr');
                    //(2.) 取得目前所在是第幾個
                    //取得所有th
                    let thparents = trparent.querySelectorAll('th');
                    //目前是誰
                    let thparent = target.parentElement.parentElement.parentElement.parentElement;
                    //找出目前是第幾個
                    const liIndex = Array.prototype.indexOf.call(thparents, thparent);

                    //生成表格
                    AddTableShow(Table,thparents,liIndex);
                    break;
            }
        });
    }
}

//3.生成表頭
function TableAddFieldTheader(thparents,liIndex)
{
    try {
        let theader_array = [];
        let theadername_array = [];

        //每個資料都退1(需要處理幾次)
        let number = 0;
        for(let i=0; i<Number(thparents.length + 1); i++)
        {
            //th數量新增
            theader_array[i] = {"data": "t" + Number(i+1)};
            if( number == 0)
            {
                //th名稱
                const obj = {};
                obj["name"] = thparents[i].querySelector('input').value;
                theadername_array[i] = obj;
                if(liIndex == i && number == 0)
                {
                    //發生之後就不可以為0，因為添加資料都會讀前一比
                    number = thparents.length;
                }
            }else if( number > 0)
            {
                //th名稱
                const obj = {};
                obj["name"] = thparents[i - 1].querySelector('input').value;
                theadername_array[i] = obj;
                number = number - 1;
            }
        }

        newjson['theader'] = theader_array;
        newjson['theader_name'] = theadername_array;
        return true;
    } catch (e) {
        console.error('表頭生成失敗，請檢查 TableAddFieldTheader()');
        return false;
    }
}

//4.生成內容
function TableAddFieldTbody(Table,liIndex)
{
    try {
        let tbody_array = [];
        //(1.) 取得tbody有多少列
        let tbody = Table.querySelector('tbody');
        let tbody_tr = tbody.querySelectorAll('tr');
        //(2.) 產生一排tbody 內容
        //每個資料都退1(需要處理幾次)
        let number = 0;
        let rowspan_data = ''; //有合併的狀況發生
        let rowspan_number = 0; //有合併的狀況發生
        let rowspan_key = ''; //紀錄key

        for(let j=0; j<tbody_tr.length; j++)
        {
            const obj = {};
            const rowspan = {};
            //取得td
            let tbodytds = tbody_tr[j].querySelectorAll('td');
            let length = newjson.theader.length;
            for(let i=0; i<length; i++)
            {
            if(number == 0)
                {
                    let key = "t" + Number(i + 1);
                    let index = tbodytds[i] ? i : (i - 1 ) >= 0 ? (i-1) : 0;
                    if(rowspan_number > 0)
                    {
                        obj[key] = rowspan_data;
                        rowspan_number = rowspan_number - 1;
                    }
                    else
                    {
                        obj[key] = tbodytds[index].querySelector('input').value;
                    }

                    //判斷是否有合併儲存格
                    if(tbodytds[index].getAttribute('rowspan') > 1)
                    {
                        let key2 = "rowspan";
                        obj[key2] = tbodytds[index].getAttribute('rowspan');
                        let key3 = "rowspan_index";
                        obj[key3] = tbodytds[index].getAttribute('rowspan_index');
                        rowspan_number = 1;
                        rowspan_data = tbodytds[index].getAttribute('rowspan_old');
                        rowspan_key = key;
                    }

                    //判斷是否有合併儲存格
                    if(tbodytds[index].getAttribute('colspan') > 1)
                    {
                        let key2 = "colspan";
                        obj[key2] = tbodytds[index].getAttribute('colspan');
                        let key3 = "colspan_index";
                        obj[key3] = tbodytds[index].getAttribute('colspan_index');
                    }

                    if(liIndex == i && number == 0)
                    {
                        //發生之後就不可以為0，因為添加資料都會讀前一筆
                        //已theader 預設 t1~t6 長度為主
                        number = jsonDataTable.theader.length;
                    }
                }else  if(number > 0){
                    let key = "t" + Number(i + 1);
                    let index = (i - 1 ) >= 0 ? (i-1) : 0;
                    obj[key] = tbodytds[index].querySelector('input').value;
                    number = number - 1;
                }

            }
            tbody_array[j] = obj;
        }

        newjson['tbody'] = tbody_array;
        console.log(newjson);
        return true;
    } catch (e) {
        console.error('表格內容生成失敗，請檢查 TableAddFieldTbody()');
        return false;
    }
}


//生成表格同步處理
async function AddTableShow(Table,thparents,liIndex)
{
    let promise1 = await new Promise((resolve,reject)=>{
        //生成表頭
        let TableHeader = TableAddFieldTheader(thparents,liIndex);
        if(TableHeader)
        {
            resolve('header_ok');
        }
    });

    let promise2 = await new Promise((resolve,reject)=>{
        //生成內容
        let TableBody = TableAddFieldTbody(Table,liIndex);
        if(TableBody)
        {
            resolve('Finish');
        }
    });

    let promise3 = await new Promise((resolve,reject)=>{
        //測試功能
        if(demotest_start)
        {
            //測試生成次數
            if(demotest == 1)
            {
                DataTableShow.destroy();
                TableDataShow('table_id',newjson,'backend');
                demotest = demotest - 1;
                resolve('json');
            }
        }
        else
        {
            //生成表格(正式)
            DataTableShow.destroy();
            TableDataShow('table_id',newjson,'backend');
        }
    });

    //測試功能：產生json(注意此為測試用)
    let promise4 = await new Promise((resolve,reject)=>{
        var currentData = DataTableShow.rows().data().toArray();
        var jsonData = JSON.stringify(currentData);
        console.log('測試模式開啟！請注意');
    });
}


//輸出json
function DataTableJsonShow()
{
    if(newjson.theader.length == 0)
    {
        console.log(jsonDataTable);
    }
    else
    {
        console.log(newjson);
    }
}