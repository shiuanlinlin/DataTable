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
            "class": "text-left"//在合併的那格添加class,
        },
        {
            "t1": "9",
            "t2": "--", //合併資料的格子就不用保留，但還是要有這個欄位
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
            "t3": "--", //合併資料的格子就不用保留，但還是要有這個欄位
            "t4": "20",
            "colspan": 2,//橫向合併格數
            "colspan_index": 2,//從第幾格開始執行，例如 t2 合併 t3
            "class": "text-left"//在合併的那格添加class
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

//判斷到有合併格
let rowspan_array = [];


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

    //2.theader功能選單(後台用)
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
                <button type="button" data-table="del_field" class="dropdown-item">
                    <img src="./img/xmark-solid.svg" class="dropdown_delicon" alt="移除此欄位">
                    移除此欄位
                </button>
            </div>
        </div>
    `;

    //2-1.tbody功能選單(後台用)
    let tbodymenuTool = `
        <div class="dropdown">
            <button class="dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false">
                <img src="./img/ellipsis-vertical-solid.svg" class="dropdown_menuicon">
            </button>
            <div class="dropdown-menu">
                <button type="button" data-table="bottom_add" class="dropdown-item">
                    <img src="./img/down-long-solid.svg" class="dropdown_righticon" alt="向下新增一列">
                    向下新增一列
                </button>
                <button type="button" data-table="del_column" class="dropdown-item">
                    <img src="./img/xmark-solid.svg" class="dropdown_delicon" alt="移除此列">
                    移除此列
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
                    $(td).html('<div class="backend_menu"><input type="text" value="' + cellData + '">'+tbodymenuTool+'</div>');
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
                $(row).find(`td:eq(${rowspan_index})`).attr('rowspan_index', data.rowspan_index);

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
                    DataTableJsonShow();
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
                //移除
                case "del_field":
                    //取得目前是幾欄位
                    let field = DataTableShow.columns().count();
                    if(field == 1)
                    {
                        swal({
                            title: "只剩下一欄位！無法移除",
                            text: "如需修改資料請操作表格上的功能",
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,
                        });
                    }
                    else
                    {
                        swal({
                            title: "確認要移除此欄位?",
                            text: "刪除此欄位包含下方資料將都被移除，請再次確認!",
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,
                        })
                        .then((willDelete) => {
                            if (willDelete) {

                                //(1.) 先取得目前所在欄位
                                let trparent = Table.querySelector('thead tr');
                                //(2.) 取得目前所在是第幾個
                                //取得所有th
                                let thparents = trparent.querySelectorAll('th');
                                //目前是誰
                                let thparent = target.parentElement.parentElement.parentElement.parentElement;
                                //找出目前是第幾個
                                const liIndex = Array.prototype.indexOf.call(thparents, thparent);
                                //移除欄位
                                DelTableShow(Table,thparents,liIndex);
                            }
                        });
                    }

                    break;
                //向下新增一列
                case 'bottom_add':
                    //(1.)取得目前所在td位置
                    let tdposition = target.parentElement.parentElement.parentElement.parentElement;
                    //(2.)取得目前所在tr
                    let trposition = tdposition.parentElement;
                    //(3.) tr 是第幾個
                    let tbody = Table.querySelector('tbody');
                    let tbody_tr = tbody.querySelectorAll('tr');
                    const tr_index = Array.prototype.indexOf.call(tbody_tr, trposition);
                    //(4.) td 是第幾個
                    let tbody_td = trposition.querySelectorAll('td');
                    const td_index = Array.prototype.indexOf.call(tbody_td, tdposition);
                    //新增列表
                    AddRowTableShow(Table,tbody_tr,tdposition,tr_index,td_index);
                    break;
                case 'del_column':
                    //取得目前是幾欄位
                    let row_number = DataTableShow.rows().count();
                    if(row_number == 1)
                    {
                        swal({
                            title: "只剩下一列！無法移除",
                            text: "如需修改資料請操作表格上的功能",
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,
                        });
                    }
                    else
                    {
                        swal({
                            title: "確認要移除此列?",
                            text: "刪除此列包含整列資料將都被移除，請再次確認!",
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,
                        })
                        .then((willDelete) => {
                            if (willDelete) {

                                //(1.)取得目前所在td位置
                                let tdposition = target.parentElement.parentElement.parentElement.parentElement;
                                //(2.)取得目前所在tr
                                let trposition = tdposition.parentElement;
                                //(3.) tr 是第幾個
                                let tbody = Table.querySelector('tbody');
                                let tbody_tr = tbody.querySelectorAll('tr');
                                const tr_index = Array.prototype.indexOf.call(tbody_tr, trposition);
                                //(4.) td 是第幾個
                                let tbody_td = trposition.querySelectorAll('td');
                                const td_index = Array.prototype.indexOf.call(tbody_td, tdposition);
                                //移除列
                                DelRowTableShow(Table,tbody_tr,tr_index);
                            }
                        });
                    }
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
async function TableAddFieldTbody(Table,liIndex, status)
{
    try {
        let TableTbodyData_array = TableTbodyData(Table);
        let add_array = [];
        let add_td = [];
        let tbody_array = [];
        //看是否有合併欄位的資料，如果有，需要先加進去
        if(rowspan_array.length > 0)
        {
            rowspan_array.forEach(item=>{
                let tr_index = item.tr_index;
                const obj = {};
                obj['rowspan'] = item.rowspan;
                obj['rowspan_index'] = item.rowspan_index;
                TableTbodyData_array[tr_index].push(obj);
            });
            //處理完成清空
            rowspan_array = [];
        }

        //新增欄位使用
        if(status = "add")
        {
            //取得每欄位的 t2
            for(let i=0; i<TableTbodyData_array.length; i++)
            {
                for(let j=0; j<TableTbodyData_array[i].length; j++)
                {
                    if(j == liIndex)
                    {
                        add_td[j] = TableTbodyData_array[i][j];
                    }

                }
                add_array[i] = add_td;
                add_td = [];
            }
            //將資料加進去
            for(let i=0; i<TableTbodyData_array.length; i++)
            {
                TableTbodyData_array[i].splice(liIndex, 0, add_array[i][liIndex]);
            }
        }

        //移除欄位使用
        if(status == 'del')
        {
            //將資料移除
            for(let i=0; i<TableTbodyData_array.length; i++)
            {
                TableTbodyData_array[i].splice(liIndex, 1,);
            }
        }

        //取得正常的 td 長度
        let length = newjson.theader.length;

        //整理資料
        for(let i=0; i<TableTbodyData_array.length; i++)
        {
            const obj = {};
            for(let j=0; j<TableTbodyData_array[i].length; j++)
            {
                if( (j+1) <= length )
                {
                    const key = "t" + (j+1);
                    obj[key] = TableTbodyData_array[i][j];
                }

                if( (j+1) > length ){
                    //多餘的資料檢查，如果有合併欄位資訊就寫進去
                    if(TableTbodyData_array[i][j].rowspan)
                    {
                        obj["rowspan"] = TableTbodyData_array[i][j].rowspan;
                        obj["rowspan_index"] = TableTbodyData_array[i][j].rowspan_index;
                    }
                }
            }
            tbody_array[i] = obj;
        }

        console.log("最終資料");
        newjson['tbody'] = tbody_array;
        console.log(newjson);
        return true
    }catch(e)
    {
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

//移除欄位
async function DelTableShow(Table,thparents,liIndex)
{
    let promise1 = await new Promise((resolve,reject)=>{
        //移除表頭
        let TableHeader = TableDelFieldTheader(thparents,liIndex);
        if(TableHeader)
        {
            resolve('del_header_ok');
        }
    });

    let promise2 = await new Promise((resolve,reject)=>{
        //移除內容
        //let TableBody = TableDelFieldTbody(Table,liIndex);
        let TableBody = TableAddFieldTbody(Table,liIndex, 'del');
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

//移除表頭
function TableDelFieldTheader(thparents,liIndex)
{
    try{
        let theader_array = [];
        let theadername_array = [];
        let length = thparents.length - 1;

        //用來移除資料使用
        let delname = [];

        //先存所有表頭內容
        for(let i=0; i<thparents.length;i++)
        {
            delname.push(thparents[i].querySelector('input').value);
        }

        //移除陣列
        delname.splice(liIndex, 1);
        //在處理格式
        for(let i=0; i<length;i++)
        {
            //規格處理
            theader_array[i] = {"data": "t" + (i+1) };
            //塞入表頭資料
            const key = "name";
            const obj = {};
            obj[key] = delname[i];
            theadername_array[i] = obj;
        }

        newjson['theader'] = theader_array;
        newjson['theader_name'] = theadername_array;
        return true
    }catch(e)
    {
        console.error("移除表頭欄位 TableDelFieldTheader() 發生錯誤，請檢查");
        return false
    }
}

//新增列表
async function AddRowTableShow(Table,tbody_tr,tdposition,tr_index,td_index)
{
    let promise1 = await new Promise((resolve,reject)=>{
        //新增列表 - 處理表頭
        let TableHeader = TableAddRowTheader(Table);
        if(TableHeader)
        {
            resolve('add_row_header_ok');
        }
    });

    let promise2 = await new Promise((resolve,reject)=>{
        //新增列表 - 處理內容
        let TableBody = TableAddRowTbody(tbody_tr,tr_index,'add');
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


//新增列表 - 處理表頭(新增與移除共用，因為表頭不會被影響)
function TableAddRowTheader(Table)
{
    try{
        //(1.)先抓取目前的表頭(雖然只有列表新增，但還是要抓頁面上的值)
        let theader_array = [];
        let theadername_array = [];
        let thead = Table.querySelector('thead');
        let thead_td = thead.querySelectorAll('th');

        let i=0;
        thead_td.forEach(item=>{
            theader_array[i] = {"data": "t"+(i+1)};
            i++
        });

        let j = 0;
        thead_td.forEach(item=>{
            theadername_array[j] = {"name": item.querySelector('input').value};
            j++
        });

        newjson['theader'] = theader_array;
        newjson['theader_name'] = theadername_array;
        return true
    }catch(e)
    {
        console.error("新增一列輸出表頭 TableAddRowTheader() 發生錯誤，請檢查");
        return false
    }
}

//新增列表 - 處理內容
function TableAddRowTbody(tbody_tr,tr_index,status)
{
    try{
        //(1.) 先將所有資料存入陣列
        let tbody_tr_array = [];
        let td_array = [];
        let tbody_array = [];

        //取得td長度，怕有合併格的問題，所以取原始資料
        const td_length = newjson.theader.length;
        //將頁面資料整理起來
        for(let i=0; i<tbody_tr.length; i++)
        {
            for(let j=0; j<td_length; j++)
            {
                td_array[j] = tbody_tr[i].querySelectorAll('td')[j].querySelector('input').value;
            }

            tbody_tr_array[i] = td_array;
            td_array = [];
        }

        //如果是要新增加一列
        if(status == 'add')
        {
            //(2.)處理新增加的資料
            let Add_array = tbody_tr_array[tr_index];
            //(3.)將他插入
            tbody_tr_array.splice(tr_index,0,Add_array);
        }

         //如果是要移除一列
         if(status == 'del')
         {
            tbody_tr_array.splice(tr_index,1);
         }

        //(4.)將資料整理成正確json
        for(let i=0; i<tbody_tr_array.length;i++)
        {
            const obj = {};
            for(let j=0; j<tbody_tr_array[i].length;j++)
            {
                const key = "t"+(j+1);
                obj[key] = tbody_tr_array[i][j];
            }
            tbody_array[i] = obj;
        }

        newjson['tbody'] = tbody_array;
        return true
    }
    catch(e)
    {
        console.error("新增一列內容 TableAddRowTbody() 發生錯誤，請檢查");
        return false
    }
}


//移除列
async function DelRowTableShow(Table,tbody_tr,tr_index)
{
    let promise1 = await new Promise((resolve,reject)=>{
        //移除列表 - 處理表頭
        let TableHeader = TableAddRowTheader(Table);
        if(TableHeader)
        {
            resolve('del_row_header_ok');
        }
    });

    let promise2 = await new Promise((resolve,reject)=>{
        //移除列表 - 處理內容
        let TableBody = TableAddRowTbody(tbody_tr,tr_index,'del');
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

//取得tbody資料
function TableTbodyData(Table)
{
    try{
        //1.取得表格 tr
        let tbody = Table.querySelector('tbody');
        let tbody_tr = tbody.querySelectorAll('tr');

        //2.先存取未處理的資料
        let tbody_tr_array = [];
        let tbody_td_array = [];

        //取得目前是幾欄位
        let field = DataTableShow.columns().count();
        //取得目前是幾列
        let row = DataTableShow.rows().count();

        //判斷是否要開始讀前一個資料
        let number = 0;

        //合併資料
        let rowspan_data = [];

        //先取得頁面舊資料
        for(let i=0; i<row; i++)
        {
            //有合併欄位，下一項要處理
            if(number > 0)
            {
                for(let j=0; j<field; j++)
                {
                    //有合併的資料需要讀前一項
                    let index = (j-1) > -1 ? (j-1) : 0;
                    const td_tag = tbody_tr[i].querySelectorAll('td')[index];
                    let td_input = td_tag.querySelector('input').value;
                    tbody_td_array.push(td_input);
                }
                //處理完這一行，取消
                number = number - 1;
            }

            //沒有合併欄位
            if(number == 0)
            {
                for(let j=0; j<field; j++)
                {
                    const td_tag = tbody_tr[i].querySelectorAll('td')[j];
                    if(td_tag)
                    {
                        let td_input = td_tag.querySelector('input').value;
                        tbody_td_array.push(td_input);

                        //判斷是否有合併欄位
                        if(td_tag.getAttribute('rowspan') > 1)
                        {
                            //有的話紀錄進去
                            rowspan_data['tr_index'] = i;
                            rowspan_data['td_index'] = j;
                            rowspan_data['rowspan'] = td_tag.getAttribute('rowspan');
                            rowspan_data['rowspan_index'] = td_tag.getAttribute('rowspan_index');
                            rowspan_array.push(rowspan_data);
                            number = Number(td_tag.getAttribute('rowspan')) - 1;
                            //使用完，清空
                            rowspan_data = [];
                        }
                    }
                    else
                    {
                        tbody_td_array.push('這不應該發生');
                    }
                }

            }

            tbody_tr_array[i] = tbody_td_array;
            //清空
            tbody_td_array = [];
        }
        return tbody_tr_array;
    }
    catch(e)
    {
        console.error("取得tbody資料失敗 TableTbodyData() 發生錯誤，請檢查");
        return false
    }

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