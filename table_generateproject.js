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
let colspan_array = [];

//判斷是否有class
let class_array = [];

//後台td功能按鈕
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
                <button type="button" data-table="colspan_merge" class="dropdown-item">
                    <img src="./img/right-long-solid-green.svg" class="dropdown_colspanicon" alt="向右合併">
                    向右合併
                </button>
                <button type="button" data-table="rowspan_merge" class="dropdown-item">
                    <img src="./img/down-long-solid-green.svg" class="dropdown_righticon" alt="向下合併">
                    向下合併
                </button>
                <button type="button" data-table="cancel_merge" class="dropdown-item">
                    <img src="./img/xmark-solid.svg" class="dropdown_delicon" alt="取消合併">
                    取消合併
                </button>
                <button type="button" data-table="del_column" class="dropdown-item text-danger">
                    <img src="./img/xmark-solid.svg" class="dropdown_delicon" alt="移除此列">
                    移除此列
                </button>
            </div>
        </div>
    `;

//頁籤
//1.生成表格
//TableDataShow(id,json,status)
//2.按鈕功能作用
//DataTableOtherButton(id,tableid)
//3.生成表頭
//TableAddFieldTheader(thparents,liIndex)
//4.生成內容(產生tbody)
//TableAddFieldRowTbody(Table,liIndex, status)
//5.生成表格同步處理
//AddTableShow(Table,thparents,liIndex)
//6.移除欄位
//DelTableShow(Table,thparents,liIndex)
//7.移除表頭
//TableDelFieldTheader(thparents,liIndex)
//8.新增列表
//AddRowTableShow(Table,tbody_tr,tdposition,tr_index,td_index)
//9.新增列表 - 處理表頭(新增與移除共用，因為表頭不會被影響)
//TableAddRowTheader(Table)
//10.移除列
//DelRowTableShow(Table,tbody_tr,tr_index)
//11.取得tbody資料
//TableTbodyData(Table)
//12.輸出json
//DataTableJsonShow(Table)
//13.抓取表頭資料
//TableTHeadData(Table)
//14.向右合併
//ColspanMerge(Table,position_array)
//15.抓出目前表格td所在位置
// TDposition(Table,target)
//16.儲存格處理
//ColspanHtml(id)
//17.取消合併
//CancelMerge(Table,position_array)
//18.取得合併格的資料(只有處理列表與列表和欄位，沒有單獨處理欄位)
//ColspanRowspanArray(id);
//19.取得單獨欄位的合併資訊
//OnlyRowspanArray(Table)


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
    table.css({'width':'100%'});
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
                    //找到需要設定的td或th
                    if (i == colspan_index) {
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

    ///16.儲存格處理
    if(json.tbody.length>0)
    {
        ColspanHtml(id);
    }
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
                    DataTableJsonShow(Table);
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
                //向右合併
                case "colspan_merge":
                    let position_array = TDposition(Table,target);
                    ColspanMerge(Table,position_array);
                    break;
                //取消合併
                case "cancel_merge":
                    let position_array2 = TDposition(Table,target);
                    CancelMerge(Table,position_array2);
                    break;
                //向下合併
                case "rowspan_merge":
                    let position_array4 = TDposition(Table,target);
                    RowspanMerge(Table,position_array4);
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

//4.生成內容(產生tbody)
async function TableAddFieldRowTbody(Table,liIndex,position_array,status)
{
    let TableTbodyData_array = [];
    //取得總長度
    let row = DataTableShow.rows().count();

    let promise1 = await new Promise((resolve,reject)=>{
        TableTbodyData_array = TableTbodyData(Table);
        if(TableTbodyData_array.length > 0)
        {
            resolve('TableTbodyData_ok');
        }
    });

    let promise2 = await new Promise((resolve,reject)=>{
        let add_array = [];
        let add_td = [];
        let tbody_array = [];

        //向下合併
        if(status == "rowspan_merge")
        {
            console.log(position_array);
            //(1.)取得tr位置
            const tr_index = position_array.tr_index;
            const td_index = position_array.td_index;
            //(2.)取得資料tr位置
            const tr_data = TableTbodyData_array[tr_index];
            console.log(tr_data);
            //(3.)取得合併位置是否是一樣的
            const rowspanData = tr_data.filter(item=>{
                return item.rowspan;
            });
            //判斷是否本來就有合併的欄位
            if(rowspanData.length > 0)
            {
                const rowspan_index = tr_data.filter(item=>{
                    return item.rowspan_index;
                });
                const rowspanindex = Number(rowspan_index[0].rowspan_index) - 1;
                const rowspan = Number(rowspanData[0].rowspan);

                //取得目前的位置如果超過表格的數量就不要更動
                //因為 tr_index是從0開始的，所以要加回去
                let Tablerow =  (tr_index+1) + rowspan;

                if(rowspanindex == td_index && row >= Tablerow)
                {
                    tr_data.forEach(item=>{
                        if(item.rowspan)
                        {
                            item.rowspan = rowspan + 1;
                        }
                    });
                }
            }

            //如果沒有合併的欄位
            if(rowspanData.length == 0)
            {
                //取得目前的位置如果超過表格的數量就不要更動
                //因為 tr_index是從0開始的，所以要加回去
                let first_Tablerow = tr_index+1;
                if( row >= first_Tablerow )
                {
                    //(4.)先找出要合併的資料，給予合併資訊，一次合併一個就可以
                    const first_rowspan = {"rowspan": 2};
                    const first_rowspan_index = {"rowspan_index": (td_index+1)};
                    tr_data.push(first_rowspan);
                    tr_data.push(first_rowspan_index);
                }
            }

        }

        //新增列表使用
        if(status == "row_add")
        {
            //(2.)處理新增加的資料
            let Add_array = TableTbodyData_array[liIndex];
            //如果有合併格數就關閉
           let rowsfilter = Add_array.filter((item)=>{
                return !item.rowspan
            });

            let rowsindexfilter = rowsfilter.filter((item)=>{
                return !item.rowspan_index
            });
            //(3.)將他插入
            TableTbodyData_array.splice(liIndex+1,0,rowsindexfilter);
        }

        //移除欄位使用
        if(status == "row_del")
        {
            //將資料移除
            TableTbodyData_array.splice(liIndex,1);
        }

        //新增欄位使用
        if(status == "add")
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

        console.log("整理資料前");
        console.log(TableTbodyData_array);

        //整理資料
        for(let i=0; i<TableTbodyData_array.length; i++)
        {
            const obj = {};
            for(let j=0; j<TableTbodyData_array[i].length; j++)
            {
                if(!TableTbodyData_array[i][j]['colspan'] && !TableTbodyData_array[i][j]['colspan_index'] && !TableTbodyData_array[i][j]['rowspan'] && !TableTbodyData_array[i][j]['rowspan_index'] && !TableTbodyData_array[i][j]['class'])
                {
                    const key = "t"+(j+1);
                    obj[key] = TableTbodyData_array[i][j];
                }
                if(TableTbodyData_array[i][j]['colspan'] || TableTbodyData_array[i][j]['colspan_index'] || TableTbodyData_array[i][j]['rowspan'] || TableTbodyData_array[i][j]['rowspan_index'] || TableTbodyData_array[i][j]['class'])
                {
                    if(TableTbodyData_array[i][j]['colspan'])
                    {
                        const key = "colspan";
                        obj[key] = TableTbodyData_array[i][j]['colspan'];
                    }

                    if(TableTbodyData_array[i][j]['colspan_index'])
                    {
                        const key = "colspan_index";
                        obj[key] = TableTbodyData_array[i][j]['colspan_index'];
                    }

                    if(TableTbodyData_array[i][j]['rowspan'])
                    {
                        const key = "rowspan";
                        obj[key] = TableTbodyData_array[i][j]['rowspan'];
                    }

                    if(TableTbodyData_array[i][j]['rowspan_index'])
                    {
                        const key = "rowspan_index";
                        obj[key] = TableTbodyData_array[i][j]['rowspan_index'];
                    }

                    if(TableTbodyData_array[i][j]['class'])
                    {
                        const key = "class";
                        obj[key] = TableTbodyData_array[i][j]['class'];
                    }

                }
            }

            tbody_array[i] = obj;
        }

        console.log("整理資料後");
        console.log(TableTbodyData_array);
        newjson['tbody'] = tbody_array;
        return true
    });
}


//5.生成表格同步處理
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
        let TableBody = TableAddFieldRowTbody(Table,liIndex,'','add');
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
        console.log(jsonData);
        console.log('測試模式開啟！請注意');
    });
}

//6.移除欄位
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
        let TableBody = TableAddFieldRowTbody(Table,liIndex,'', 'del');
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
        console.log(jsonData);
        console.log('測試模式開啟！請注意');
    });
}

//7.移除表頭
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

//8.新增列表
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
        let TableBody = TableAddFieldRowTbody(Table,tr_index,'','row_add');
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
        console.log(jsonData);
        console.log('測試模式開啟！請注意');
    });
}


//9.新增列表 - 處理表頭(新增與移除共用，因為表頭不會被影響)
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

//10.移除列
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
        let TableBody = TableAddFieldRowTbody(Table,tr_index,'','row_del');
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
        console.log(jsonData);
        console.log('測試模式開啟！請注意');
    });
}

//11.取得tbody資料
function TableTbodyData(Table)
{
    //1.取得表格 tr
    let tbody = Table.querySelector('tbody');
    let tbody_tr = tbody.querySelectorAll('tr');
    let id = Table.id;
    // //取得目前是幾欄位
    // let field = DataTableShow.columns().count();
    // //取得目前是幾列
    // let row = DataTableShow.rows().count();

    let tbody_tr_array = [];
    //let td_array = [];
    let array = [];
    let RowspanArray = [];

     //18.取得合併格的資料(只有處理列表與列表和欄位，沒有單獨處理欄位)
     array = ColspanRowspanArray(id);

    //19.取得單獨欄位的合併資訊
    RowspanArray = OnlyRowspanArray(Table);

    //取得頁面上所有資訊
    for(let i=0; i<tbody_tr.length; i++)
    {
        let td_array = [];

        for(let j=0; j<tbody_tr[i].querySelectorAll('td').length; j++)
        {
            let td_tab = tbody_tr[i].querySelectorAll('td')[j];
            let td_value = td_tab.querySelector('input').value;
            td_array[j] = td_value;
        }
        tbody_tr_array[i] = td_array;
    }

    //處理合併資料
    //取得資料後開始處理
    //整合資訊
    RowspanArray.forEach(item=>{
        array.push(item);
    });

    if(array.length > 0)
    {
        for(let i=0; i<array.length; i++)
        {
            if(array[i].colspan && !array[i].rowspan)
            {
                //先取得目前在第幾個
                let colspan = Number(array[i].colspan) - 1;
                let colspan_index = Number(array[i].colspan_index);
                let tr_index = Number(array[i].tr_index);
                let td_index = Number(array[i].td_index);
                //取得全部的td數量
                let td_length = newjson.theader.length;
                //取得目前資料有幾格
                let td_data = tbody_tr_array[tr_index].length;
                //ex: 總數 4 扣掉 目前資料數量3 = 少一格
                let Allbox = td_length - td_data;
                //取得目前資料有幾格
                // console.log("全部的td數量 :" + td_length);
                // console.log("目前資料數量 :" + td_data);
                // console.log("目前資料少 :" + Allbox);

                //補上資料
                //console.log(tbody_tr_array);
                for(let i=0; i<colspan; i++)
                {
                    let index = colspan_index - 1 > -1 ? 0 : colspan_index;
                    let value_data = tbody_tr_array[tr_index][index];
                    tbody_tr_array[tr_index].splice(colspan_index+i,0,value_data);
                }


                //插入合併資訊
                let colspanobj = {"colspan": colspan + 1};
                let colspanindexobj = {"colspan_index": colspan_index};
                tbody_tr_array[tr_index].push(colspanobj);
                tbody_tr_array[tr_index].push(colspanindexobj);
                if(array[i].class)
                {
                    let classxobj = {"class": array[i].class};
                    tbody_tr_array[tr_index].push(classxobj);
                }
                //console.log(tbody_tr_array);
            }

            if(array[i].rowspan && !array[i].colspan)
            {
                //先取得目前在第幾個
                let rowspan = Number(array[i].rowspan);
                let rowspan_index = Number(array[i].rowspan_index) - 1;
                let tr_index = Number(array[i].tr_index);
                let td_index = Number(array[i].td_index);
                //取得全部的td數量
                let td_length = newjson.theader.length;

                //找出自己(回寫合併資訊)
                //插入合併資訊
                let rowspanobj = {"rowspan": rowspan};
                let rowspanindexobj = {"rowspan_index": rowspan_index + 1};
                tbody_tr_array[tr_index].push(rowspanobj);
                tbody_tr_array[tr_index].push(rowspanindexobj);
                if(array[i].class)
                {
                    let classxobj = {"class": array[i].class};
                    tbody_tr_array[tr_index].push(classxobj);
                }
                for(let i=1; i<rowspan; i++)
                {
                    //先取得前一個資料
                    let index = rowspan_index - 1 > -1 ? rowspan_index-1 : 0;
                    let value_data = tbody_tr_array[tr_index + i][index];
                    tbody_tr_array[tr_index + i].splice(rowspan_index,0,value_data);
                }
            }



            if(array[i].rowspan && array[i].colspan)
            {
                //先取得目前在第幾個
                let colspan = Number(array[i].colspan) - 1;
                let colspan_index = Number(array[i].colspan_index) - 1;
                let rowspan = Number(array[i].rowspan);
                let rowspan_index = Number(array[i].rowspan_index) - 1;
                let tr_index = Number(array[i].tr_index);
                let td_index = Number(array[i].td_index);
                //取得全部的td數量
                let td_length = newjson.theader.length;
                //取得目前資料有幾格
                let td_data = tbody_tr_array[tr_index].length;
                //ex: 總數 4 扣掉 目前資料數量3 = 少一格
                let Allbox = td_length - td_data;

                for(let i=1; i<colspan+1; i++)
                {
                    let index = colspan_index;
                    let value_data = tbody_tr_array[tr_index][index];
                    tbody_tr_array[tr_index].splice(colspan_index+i,0,value_data);

                }

                //插入合併資訊
                let colspanobj = {"colspan": colspan + 1};
                let colspanindexobj = {"colspan_index": colspan_index + 1};
                let rowspanobj = {"rowspan": rowspan};
                let rowspanindexobj = {"rowspan_index": rowspan_index + 1};
                tbody_tr_array[tr_index].splice((td_length),0,colspanobj);
                tbody_tr_array[tr_index].splice((td_length + 1),0,colspanindexobj);
                tbody_tr_array[tr_index].splice((td_length+ 2 ),0,rowspanobj);
                tbody_tr_array[tr_index].splice((td_length + 3),0,rowspanindexobj);
                //塞入class
                if(array[i].class)
                {
                    let classxobj = {"class": array[i].class};
                    tbody_tr_array[tr_index].splice((td_length + 2),0,classxobj);
                }

                for(let i=1; i<rowspan; i++)
                {
                    //先取得前一個資料
                    for(let j=0; j<colspan+1; j++)
                    {
                        let c_index = colspan_index - 1 > -1 ? 0 : colspan_index;
                        let value_data = tbody_tr_array[tr_index+i][c_index];
                        tbody_tr_array[tr_index+i].splice(colspan_index+j,0,value_data);
                    }
                }
            }
        }
    }
    return tbody_tr_array;
}


//12.輸出json
function DataTableJsonShow(Table)
{
    TableTHeadData(Table);
    TableAddFieldRowTbody(Table,0);
    console.log(newjson);
    return newjson
}

//13.抓取表頭資料
function TableTHeadData(Table)
{
    try {
        //取得目前是幾欄位
        let Thead = Table.querySelector('thead');
        let Thead_tr = Table.querySelectorAll('th');
        let field = DataTableShow.columns().count();
        let theader_array = [];
        let theadername_array = [];

        for(let i=0; i<field; i++)
        {
            //欄位數量回寫
            theader_array[i] = {"data": "t" + Number(i+1)};
            //th內容獲得
            theadername_array[i] = {"name": Thead_tr[i].querySelector('input').value};
        }

        newjson['theader'] = theader_array;
        newjson['theader_name'] = theadername_array;
        return true;
    } catch (e) {
        console.error('13.抓取表頭資料，請檢查 TableTHeadData()');
        return false;
    }
}

//14.向右合併
function ColspanMerge(Table,position_array){
    //(1.)找出目前位置
    let tr_position = position_array.trposition;
    let td_position = position_array.tdposition;
    let tr_index = position_array.tr_index;
    let td_index = position_array.td_index;

    if(tr_position.querySelectorAll('td')[td_index + 1])
    {
        //本身如果是合併格，就直接添加 colSpan = 3 並且 colspan_index - 1
        let All_colspan = tr_position.querySelectorAll('td')[td_index].getAttribute('colspan');
        let All_colspan_next = tr_position.querySelectorAll('td')[td_index + 1].getAttribute('colspan');
        let All_rowspan = tr_position.querySelectorAll('td')[td_index].getAttribute('rowspan');

        if(All_colspan > 1 && (!All_rowspan || All_rowspan == 1))
        {
            let colspan_length = Number(tr_position.querySelectorAll('td')[td_index].getAttribute('colspan')) + 1;
            let colspan_index = td_index - 1 > 1 ? td_index - 1 : 1;
            tr_position.querySelectorAll('td')[td_index].colSpan = colspan_length;
            tr_position.querySelectorAll('td')[td_index].setAttribute('colspan_index', colspan_index);
            //下一個列表要刪除
            tr_position.querySelectorAll('td')[td_index+1].remove();
        }

        if( All_colspan_next > 1 && (!All_rowspan || All_rowspan == 1))
        {
            let colspan_length = Number(tr_position.querySelectorAll('td')[td_index + 1].getAttribute('colspan')) + 1;
            let colspan_index = Number(tr_position.querySelectorAll('td')[td_index + 1].getAttribute('colspan_index')) - 1 > 1 ? Number(tr_position.querySelectorAll('td')[td_index + 1].getAttribute('colspan_index')) - 1 : 1;

            tr_position.querySelectorAll('td')[td_index].colSpan = colspan_length;
            tr_position.querySelectorAll('td')[td_index].setAttribute('colspan_index', colspan_index);
            //下一個列表要刪除
            tr_position.querySelectorAll('td')[td_index+1].removeAttribute('colspan_index');
            tr_position.querySelectorAll('td')[td_index+1].removeAttribute('colspan');
            tr_position.querySelectorAll('td')[td_index+1].remove();

        }

        if(All_rowspan > 1 && ( !All_colspan || All_colspan == 1 )){

            tr_position.querySelectorAll('td')[td_index].colSpan = 2;
            tr_position.querySelectorAll('td')[td_index].setAttribute('colspan_index', td_index + 1);
            //下一個列表要刪除
            tr_position.querySelectorAll('td')[td_index+1].remove();
            //下一行的同個位置也要移除
            let rowspan_length = Number(tr_position.querySelectorAll('td')[td_index].getAttribute('rowspan'));
            let rowspan_index = Number(tr_position.querySelectorAll('td')[td_index].getAttribute('rowspan_index'));
            let tbody_all = Table.querySelector('tbody');
            let tbody_tr_all = tbody_all.querySelectorAll('tr');
            for(let i=1; i<rowspan_length; i++)
            {
                tbody_tr_all[tr_index + i].querySelectorAll('td')[td_index].remove();
            }
        }

        //如果同時出現 colspan && rowspan
        if( All_colspan > 1 && All_rowspan > 1)
        {
            //取得頁面上的資訊
            let rowspan_length = tr_position.querySelectorAll('td')[td_index].getAttribute('rowspan');
            let rowspan_index = tr_position.querySelectorAll('td')[td_index].getAttribute('rowspan_index');
            let colspan = tr_position.querySelectorAll('td')[td_index].getAttribute('colspan');
            let colspan_index = tr_position.querySelectorAll('td')[td_index].getAttribute('colspan_index');

            tr_position.querySelectorAll('td')[td_index].colSpan = Number(colspan) + 1;
            //下一個列表要刪除
            tr_position.querySelectorAll('td')[td_index+1].remove();
            let tbody_all = Table.querySelector('tbody');
            let tbody_tr_all = tbody_all.querySelectorAll('tr');
            for(let i=1; i<rowspan_length; i++)
            {
                tbody_tr_all[tr_index + i].querySelectorAll('td')[td_index].remove();
            }

        }

        if((!All_colspan || All_colspan == 1) && (!All_colspan_next || All_colspan_next == 1) && (!All_rowspan || All_rowspan == 1) ){
            tr_position.querySelectorAll('td')[td_index].colSpan = 2;
            tr_position.querySelectorAll('td')[td_index].setAttribute('colspan_index', td_index + 1);
            //下一個列表要刪除
            tr_position.querySelectorAll('td')[td_index+1].remove();
        }

    }


}

//15.抓出目前表格td所在位置
function TDposition(Table,target)
{
    let array = [];
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

    array['tdposition'] = tdposition;
    array['trposition'] = trposition;
    array['tr_index'] = tr_index;
    array['td_index'] = td_index;

    return array;
}

//16.儲存格處理
async function ColspanHtml(id)
{
    const Table = document.getElementById(id);
    let tbody_array = Table.querySelector('tbody');
    let array = [];

    let promise1 = await new Promise((resolve,reject)=>{
        //18.取得合併格的資料(只有處理列表與列表和欄位，沒有單獨處理欄位)
        array = ColspanRowspanArray(id);
        if(array.length > 0)
        {
            resolve('ColspanRowspanArray_ok');
        }
    });

    let promise2 = await new Promise((resolve,reject)=>{
        //取得資料後開始處理
        if(array.length > 0)
        {
            for(let i=0; i<array.length; i++)
            {
                //只有縱向合併
                if(array[i].rowspan > 1 && !array[i].colspan)
                {
                    //先取得目前在第幾個
                    const tr_index = array[i].tr_index;
                    const td_length = array[i].td_length;
                    const colspan = array[i].colspan;
                    const colspan_index = Number(array[i].colspan_index);

                    const rowspan = Number(array[i].rowspan);
                    const rowspan_index = array[i].rowspan_index;

                    //ex:全部四格，合併兩格，變成三格
                    let box_number = (td_length - colspan) + 1;
                    //ex:全部四格，扣掉三格，多一格
                    let All_box = td_length - box_number;
                    //ex:全四格，合併第三格
                    let tr = tbody_array.querySelectorAll('tr')[tr_index];
                    let td = tr.querySelectorAll('td');

                    //扣掉多餘的一格或多格
                    for(let j=0; j<All_box; j++)
                    {
                        td[colspan_index + j].remove();
                    }

                    //縱向處理
                    let rowspan_num = rowspan;
                    for(let j=1; j<rowspan_num; j++)
                    {
                        let tr_rowspan = tbody_array.querySelectorAll('tr')[tr_index + j];
                        let td_rowspan = tr_rowspan.querySelectorAll('td');
                        //扣掉多餘的一格或多格
                        for(let j=0; j<All_box; j++)
                        {
                            td_rowspan[colspan_index + j].remove();
                        }
                    }

                }

                if(array[i].colspan > 1 && !array[i].rowspan )
                {
                    //console.log(array[i]);
                    //先取得目前在第幾個
                    const tr_index = array[i].tr_index;
                    const td_length = array[i].td_length;
                    const colspan = array[i].colspan;
                    const colspan_index = Number(array[i].colspan_index);

                    //ex:全部四格，合併兩格，變成三格
                    let box_number = (td_length - colspan) + 1;
                    //ex:全部四格，扣掉三格，多一格
                    let All_box = td_length - box_number;
                    //ex:全四格，合併第三格
                    let tr = tbody_array.querySelectorAll('tr')[tr_index];
                    let td = tr.querySelectorAll('td');

                    //扣掉多餘的一格或多格
                    for(let i=0; i<All_box; i++)
                    {
                        if(td[colspan_index + i])
                        {
                            td[colspan_index + i].remove();
                        }
                    }
                }

                //兩個合併格都有
                if(array[i].rowspan > 1 && array[i].colspan > 1)
                {
                    //先取得目前在第幾個
                    const tr_index = array[i].tr_index;
                    const td_length = array[i].td_length;
                    let colspan = Number(array[i].colspan);
                    let colspan_index = Number(array[i].colspan_index) - 1;
                    let rowspan = Number(array[i].rowspan);
                    let rowspan_index = Number(array[i].rowspan_index) - 1;

                    let tr_rowspan = tbody_array.querySelectorAll('tr')[tr_index];
                    let td_rowspan = tr_rowspan.querySelectorAll('td');

                    //總格數
                    let field = DataTableShow.columns().count();
                    //取得目前是幾列
                    let row = DataTableShow.rows().count();
                    //頁面上td欄位數
                    let td_Page = td_rowspan.length;
                    //計算目前頁面上應該要有的格數
                    let All_box = (td_Page - colspan) + 1;
                    //目前多的
                    let redundant = td_Page - All_box;
                    //總共有四格
                    //合併了兩格
                    //所以應該是要剩下三格

                    for(let j=1; j<redundant+1; j++)
                    {
                        td_rowspan[colspan_index + j].remove();
                    }

                    //剩下需要處理的縱向數量
                    let redundant_rowspan = rowspan;
                    let merge_colspan = colspan;
                    //縱向剩餘都會多少一個
                    let only_td = td_Page - merge_colspan;

                    for(let i=1; i<redundant_rowspan; i++)
                    {
                        //先取得總格數td
                        let Alltd = tbody_array.querySelectorAll('tr')[tr_index+i].querySelectorAll('td');
                        //用合併數量來解決
                        for(let j=0; j<Alltd.length; j++)
                        {
                            if(j > (only_td - 1))
                            {
                                Alltd[j].remove();
                            }

                        }
                    }
                }
            }
        }
    });



}

//17.取消合併
function CancelMerge(Table,position_array)
{
    //(1.)找出目前位置
    let tr_position = position_array.trposition;
    let td_position = position_array.tdposition;
    let tr_index = position_array.tr_index;
    let td_index = position_array.td_index;

    let Tbody = Table.querySelector('tbody');
    let Tr = Tbody.querySelectorAll('tr');

    //取得一列正常數量
    let td_number = newjson.theader.length == 0 ? jsonDataTable.theader.length : newjson.theader.length;

    //查看目前位置是否有合併格
    if(td_position.getAttribute('colspan') > 1 && (!td_position.getAttribute('rowspan') || td_position.getAttribute('rowspan') == 1) )
    {
        let colspan = Number(td_position.getAttribute('colspan')) - 1;
        td_position.removeAttribute('colspan');
        td_position.removeAttribute('colspan_index');
        //補上缺的格子
        for(let i=0; i<colspan; i++)
        {
            let td_Tag = document.createElement('td');
            let inpuHtml = `<div class="backend_menu"><input type="text" value="--">${tbodymenuTool}</div>`;
            td_Tag.innerHTML = inpuHtml;
            td_position.after(td_Tag);
        }
    }

    //縱向合併
    if(td_position.getAttribute('rowspan') > 1 && (!td_position.getAttribute('colspan') || td_position.getAttribute('colspan') == 1) )
    {
        //取得合併的格數
        const rowspan = Number(td_position.getAttribute('rowspan'));
        const rowspan_index = Number(td_position.getAttribute('rowspan_index')) - 1;
        td_position.removeAttribute('rowspan');
        td_position.removeAttribute('rowspan_index');

        //補上缺的格子
        for(let i=1; i<rowspan; i++)
        {
            let td_Tag = document.createElement('td');
            let inpuHtml = `<div class="backend_menu"><input type="text" value="--">${tbodymenuTool}</div>`;
            td_Tag.innerHTML = inpuHtml;
            Tr[tr_index + i].querySelectorAll('td')[rowspan_index].before(td_Tag);
        }
    }

    //縱向與橫向合併
    if(td_position.getAttribute('rowspan') > 1 && td_position.getAttribute('colspan') > 1)
    {
        //取得合併的格數
        const rowspan = Number(td_position.getAttribute('rowspan'));
        const rowspan_index = Number(td_position.getAttribute('rowspan_index')) - 1;

        td_position.removeAttribute('rowspan');
        td_position.removeAttribute('rowspan_index');

        let colspan = Number(td_position.getAttribute('colspan')) - 1;
        let colspan_index = Number(td_position.getAttribute('colspan_index')) - 1;
        td_position.removeAttribute('colspan');
        td_position.removeAttribute('colspan_index');

        //補上缺的格子
        for(let j=0; j<colspan; j++)
        {
            let td_Tag = document.createElement('td');
            let inpuHtml = `<div class="backend_menu"><input type="text" value="--">${tbodymenuTool}</div>`;
            td_Tag.innerHTML = inpuHtml;
            td_position.after(td_Tag);
        }

        //補上缺的格子
        for(let i=1; i<rowspan; i++)
        {
            let td_box = Tr[tr_index + i].querySelectorAll('td')[colspan_index];
            //補上缺的格子
            for(let j=0; j<colspan + 1; j++)
            {
                let td_Tag = document.createElement('td');
                let inpuHtml = `<div class="backend_menu"><input type="text" value="--">${tbodymenuTool}</div>`;
                td_Tag.innerHTML = inpuHtml;
                td_box.before(td_Tag);
            }
        }

    }
}

//18.取得合併格的資料(只有處理列表與列表和欄位，沒有單獨處理欄位)
function ColspanRowspanArray(id)
{
    const Table = document.getElementById(id);
    let tbody_array = Table.querySelector('tbody');
    let tbody_tr = tbody_array.querySelectorAll('tr');
    let array = [];
    let colspan_array = [];

    for(let i=0; i<tbody_tr.length; i++)
    {
        for(let j=0; j<tbody_tr[i].querySelectorAll('td').length; j++)
        {
            if(tbody_tr[i].querySelectorAll('td')[j].getAttribute('colspan') > 1 && (!tbody_tr[i].querySelectorAll('td')[j].getAttribute('rowspan')))
            {
                let colspan_index = tbody_tr[i].querySelectorAll('td')[j].getAttribute('colspan_index');
                let colspan = Number(tbody_tr[i].querySelectorAll('td')[j].getAttribute('colspan'));
                let classname = tbody_tr[i].querySelectorAll('td')[j].className;

                colspan_array['colspan_index'] = colspan_index;
                colspan_array['colspan'] = colspan;
                colspan_array['tr_index'] = i;
                colspan_array['td_index'] = j;
                colspan_array['td_length'] = tbody_tr[i].querySelectorAll('td').length;
                if(classname != "")
                {
                    colspan_array['class'] = classname;
                }

                array.push(colspan_array);
                colspan_array = [];
            }

            //如果有行數
            if(tbody_tr[i].querySelectorAll('td')[j].getAttribute('colspan') > 1 && tbody_tr[i].querySelectorAll('td')[j].getAttribute('rowspan') > 1)
            {
                let colspan_index = tbody_tr[i].querySelectorAll('td')[j].getAttribute('colspan_index');
                let colspan = Number(tbody_tr[i].querySelectorAll('td')[j].getAttribute('colspan'));

                let rowspan_index = tbody_tr[i].querySelectorAll('td')[j].getAttribute('rowspan_index');
                let rowspan = Number(tbody_tr[i].querySelectorAll('td')[j].getAttribute('rowspan'));
                let classname = tbody_tr[i].querySelectorAll('td')[j].className;

                colspan_array['colspan_index'] = colspan_index;
                colspan_array['colspan'] = colspan;
                colspan_array['tr_index'] = i;
                colspan_array['td_index'] = j;

                colspan_array['rowspan_index'] = rowspan_index;
                colspan_array['rowspan'] = rowspan;
                if(classname != "")
                {
                    colspan_array['class'] = classname;
                }

                colspan_array['td_length'] = tbody_tr[i].querySelectorAll('td').length;

                array.push(colspan_array);
                colspan_array = [];
            }
        }
    }
    return array
}

//19.取得單獨欄位的合併資訊
function OnlyRowspanArray(Table)
{
    let array = [];
    let tbody = Table.querySelector('tbody');
    let tbody_tr = tbody.querySelectorAll('tr');

    for(let i=0; i<tbody_tr.length; i++)
    {
        let td_array = [];

        for(let j=0; j<tbody_tr[i].querySelectorAll('td').length; j++)
        {
            let rowspan = Number(tbody_tr[i].querySelectorAll('td')[j].getAttribute('rowspan'));
            let rowspan_index = tbody_tr[i].querySelectorAll('td')[j].getAttribute('rowspan_index');
            let colspan = Number(tbody_tr[i].querySelectorAll('td')[j].getAttribute('colspan'));
            let classname = tbody_tr[i].querySelectorAll('td')[j].className;
            if(rowspan > 1 && (!colspan || colspan == 1))
            {
                td_array['rowspan'] = rowspan;
                td_array['rowspan_index'] = rowspan_index;
                td_array['tr_index'] = i;
                td_array['td_index'] = j;
                if(classname != "")
                {
                    td_array['class'] = classname;
                }
                array.push(td_array);
            }
        }

    }
    return array
}

//20.向下合併
async function RowspanMerge(Table,position_array)
{
    let liIndex = position_array.td_index;
    let TableTheader = false;
    let TableAddFieldRow = false;

    let promise1 = await new Promise((resolve,reject)=>{
        //處理表頭
        TableTheader = TableAddRowTheader(Table);
        if(TableTheader)
        {
            resolve('TableAddRowTheader_ok');
        }

    });


    let promise2 = await new Promise((resolve,reject)=>{
        //處理內容
        TableAddFieldRow = TableAddFieldRowTbody(Table,liIndex,position_array,'rowspan_merge');
        if(TableAddFieldRow)
        {
            resolve('TableAddFieldRowTbody_ok');
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
        console.log(jsonData);
        console.log('測試模式開啟！請注意');
    });
}