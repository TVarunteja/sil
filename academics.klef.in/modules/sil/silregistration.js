window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.pushState(null, null, window.location.href);
};

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function loadPage() {
    
    if (AID == "")
        parent.location.replace("login");

    progress.style.display = "block";
    cp.innerText = 1;
     
    qryParam();
    if (getAccess(AID, LTYPE, params["gid"], params["smid"]) == "false") {
        document.write("<h2 style='color:red'>Access Denied!</h2>");
        return;
    }  
    callAsyncAth("GET", REPOSITORY.server + `sil/getcdate`, "", loadWeekDate, errorPage);
}

function loadWeekDate(res) {
    var data = JSON.parse(res);
    d = getNextMonday(data);
    HT1.name = convertDate(d);
    HT1.value = convertDateIST(d);
    DT1.value = HT1.name;

    ed = d;
    ed = new Date(ed.setDate(ed.getDate() + 6));
    HT2.name = convertDate(ed);
    HT2.value = convertDateIST(ed);
    DT2.value = HT2.name;
    searchContent();
}

function loadPrevWeak() {
    d = new Date(HT1.name);
    d = new Date(d.setDate(d.getDate() - 7));
    HT1.name = convertDate(d);
    HT1.value = convertDateIST(d);
    DT1.value = HT1.name;

    ed = d;
    ed = new Date(ed.setDate(ed.getDate() + 6));
    HT2.name = convertDate(ed);
    HT2.value = convertDateIST(ed);
    DT2.value = HT2.name;
    searchContent();
}

function loadNextWeak() {
    d = new Date(HT1.name);
    d = new Date(d.setDate(d.getDate() + 7));
    HT1.name = convertDate(d);
    HT1.value = convertDateIST(d);
    DT1.value = HT1.name;

    ed = d;
    ed = new Date(ed.setDate(ed.getDate() + 6));
    HT2.name = convertDate(ed);
    HT2.value = convertDateIST(ed);
    DT2.value = HT2.name;
    searchContent();
}


function loadAYSuccess(res) {
    var data = JSON.parse(JSON.parse(res));
    loadDropdown('AY', data.AY);
    if (data.CAY[0] != null) {
        AY.value = data.CAY[0].ACAYEAR;
        var res = callSyncAth("GET", REPOSITORY.server + `sil/semester/${AY.value}/${AID}`, "", errorPage);
        loadDropdown('SEM', JSON.parse(JSON.parse(res)));
        SEM.value = data.CAY[0].ACACODE;
        searchContent();
    }
    progress.style.display = "none";
}

function loadSemester() {
    SEM.innerText = "";
    vdata.innerText = "";
    footer.style.visibility = "hidden";
    if (AY.selectedIndex == 0)
        return;

    progress.style.display = "block";
    callAsyncAth("GET", REPOSITORY.server + `srp/semester/${AY.value}/${AID}`, "", loadSemesterSuccess, errorPage);
}

function loadSemesterSuccess(res) {
    loadDropdown('SEM', JSON.parse(JSON.parse(res)));
    progress.style.display = "none";
}

function searchContent() {
    vdata.innerText = "";
    footer.style.visibility = "hidden";
    if (HT1.value == "" || HT2.value == "")
        return;

    progress.style.display = "block";
    const ps = parseInt(content.offsetHeight / 200);
    cp.innerText = 1;
    var data = JSON.stringify({
        AID: AID,
        FDTE: HT1.name,
        TDTE: HT2.name,
        KEY: search.value,
        CPAGE: 1,
        PAGESIZE: ps
    });
    
    callAsyncAth("POST", REPOSITORY.server + `sil/loadliveevents`, data, loadContent, errorPage);
}

function loadContent(res) {
    var data = JSON.parse(JSON.parse(res));
    var content = `<table style='width:100%'>`;
    var row = 0;
    for (var x in data.EVENTS) {
        row++;
        RSD = new Date(data.EVENTS[x].RSD);
        RED = new Date(data.EVENTS[x].RED);
        CDTE = new Date(data.EVENTS[x].CDTE);
        content += `<tr>
                    <td style='width:100%;padding:5px'>
                        <div style='width:100%;height:200px;${row % 2 == 0 ? 'background:whitesmoke' : 'background:whitesmoke'}'>
                        <table style='width:100%;height:100%'>
                        <tr>
                            <td style='width:350px;padding:5px'><img src='/imgs/sil/bg.jpg' alt='' width='340' height='185' /></td>
                            <td style='vertical-align:top;padding:5px 0px 5px 0px;position:relative'>
                                <div style='width:100%;font-size:13pt;font-weight:bold'>${data.EVENTS[x].ENAME}</div>
                                <div style='width:100%;color:gray'>by ${data.EVENTS[x].NAME} (${data.EVENTS[x].ETYPE})</div>
                                
                                <div style='width:100%;padding-top:20px;'>Event Category</div>
                                <div style='width:100%;font-weight:bold'>${data.EVENTS[x].ECID}</div>
                                <div style='width:100%;color:gray'>${data.EVENTS[x].SCATEGORY}</div>
                                <div style='width:100%;padding-top:20px;'>SIL Points: <b>${data.EVENTS[x].POINTS}</b>, Absence Penalty: <b style='color:red'>${data.EVENTS[x].PENALTY}</b> </div>
                                <label style='position:absolute;right:10px;bottom:20px;color:blue;cursor:pointer' onclick="viewSchedule('${data.EVENTS[x].EID}')">View Schedule</label>
                                <img src='/imgs/registeredlogo.png' alt='' width='100' height='100' style='position:absolute;right:0px;top:60px;${data.EVENTS[x].REGISTERED == 0 ? 'display:none' : ''}' />
                            </td>
                            <td style='width:200px;padding:5px 0px 5px 5px'>
                                <table style='width:100%;height:100%;border-left:1px solid lightgray'>
                                <tr>
                                <td style='text-align:center'>
                                    <div style='width:100%;padding-bottom:5px'>Registration Starts on</div>
                                    <div style='width:100%;color:gray'>${data.EVENTS[x].STARTDATE}</div>
                                </td>
                                </tr>
                                <tr>
                                <td style='text-align:center'>
                                    <div style='width:100%;padding-bottom:5px'>Registration Ends on</div>
                                    <div style='width:100%;color:gray'>${data.EVENTS[x].ENDDATE}</div>
                                </td>
                                </tr>
                                <tr>
                                <td style='text-align:center'>
                                    <div style='width:100%;padding-bottom:5px'>Available</div>`;

        if (data.EVENTS[x].REGTYPE <= 1) {
            content += `<div style='width:100%;font-size:14pt;font-weight:bold;${(parseInt(data.EVENTS[x].NOP) - parseInt(data.EVENTS[x].REG)) > 9 ? 'color:green' : (parseInt(data.EVENTS[x].NOP) - (parseInt(data.EVENTS[x].REG) - parseInt(data.EVENTS[x].NNP))) > 0 ? 'color:orange' : 'color:red'}'>${parseInt(data.EVENTS[x].NOP) - (parseInt(data.EVENTS[x].REG) - parseInt(data.EVENTS[x].NNP)) }</div>
                        </td>
                        </tr>
                        <tr>
                        <td style='text-align:center'>
                            ${(RSD <= CDTE && RED >= CDTE) && (data.EVENTS[x].REGISTERED == 0 && (parseInt(data.EVENTS[x].NOP) - (parseInt(data.EVENTS[x].REG) - parseInt(data.EVENTS[x].NNP))) > 0) ? `<button class='regbtn' style='cursor: pointer' onclick="register('${data.EVENTS[x].EID}')">Register</button>` : ``}
                            ${data.EVENTS[x].REGISTERED == 0 || RED < CDTE ? `` : `<div style='color:red;'>Cancel Registration? <label style='color:blue;cursor:pointer' onclick="cancelRegistration('${data.EVENTS[x].EID}')">Click here</label></div>`}
                        </td>
                        </tr>`;
        }
        else if (data.EVENTS[x].REGTYPE == 2) {
            content += `<div style='width:100%;font-size:14pt;font-weight:bold;${(parseInt(data.EVENTS[x].NNP) - parseInt(data.EVENTS[x].NREG)) > 9 ? 'color:green' : (parseInt(data.EVENTS[x].NNP) - parseInt(data.EVENTS[x].NREG)) > 0 ? 'color:orange' : 'color:red'}'>${parseInt(data.EVENTS[x].NNP) - parseInt(data.EVENTS[x].NREG)}</div >
                        </td>
                        </tr>
                        <tr>
                        <td style='text-align:center'>
                            
                        </td>
                        </tr>`;
        }
        else if (data.EVENTS[x].REGTYPE == 3) {
             content += `<div style='width:100%;font-size:14pt;font-weight:bold;${(parseInt(data.EVENTS[x].NNP) - parseInt(data.EVENTS[x].NREG)) > 9 ? 'color:green' : (parseInt(data.EVENTS[x].NNP) - parseInt(data.EVENTS[x].NREG)) > 0 ? 'color:orange' : 'color:red'}'>${parseInt(data.EVENTS[x].NNP) - parseInt(data.EVENTS[x].NREG)}</div >
                        </td>
                        </tr>
                        <tr>
                        <td style='text-align:center'>
                            ${(RSD <= CDTE && RED >= CDTE) && (data.EVENTS[x].REGISTERED == 0 && (parseInt(data.EVENTS[x].NNP) - parseInt(data.EVENTS[x].NREG)) > 0) ? `<button class='regbtn' style='cursor: pointer' onclick="register('${data.EVENTS[x].EID}')">Register</button>` : ``}
                            ${data.EVENTS[x].REGISTERED == 0 || RED < CDTE ? `` : `<div style='color:red;'>Cancel Registration? <label style='color:blue;cursor:pointer' onclick="cancelRegistration('${data.EVENTS[x].EID}')">Click here</label></div>`}
                        </td>
                        </tr>`;
        }
        else {

        }
        content += `</table>
                </td>
            </tr>
            </table>
            </div>
        </td>
        </tr>`;
    }
    content += `</table>`;
    vdata.innerHTML = content;

    var pg = "";
    if (data.PAGING.length > 1)
        for (var x in data.PAGING)
            pg += `<label id="lnkPage" class="` + (data.PAGING[x].ENABLED == "True" ? "page_disabled" : "page_enabled") + `" onclick="loadPaging('` + data.PAGING[x].VALUE + "','" + data.PAGING[x].ENABLED + `')">` + data.PAGING[x].TEXT + `</label>`;
    viewpaging.innerHTML = pg;

    if(pg!="")
        footer.style.visibility = "";

    progress.style.display = "none";
}

function loadPaging(cpage, enabled) {
    if (enabled == "True")
        return;

    progress.style.display = "block";
    const ps = parseInt(content.offsetHeight / 200);
    cp.innerText = cpage;
    var data = JSON.stringify({
        AID: AID,
        FDTE: HT1.name,
        TDTE: HT2.name,
        KEY: search.value,
        CPAGE: cpage,
        PAGESIZE: ps
    });
    callAsyncAth("POST", REPOSITORY.server + `sil/loadliveevents`, data, loadContent, errorPage);
}

function refreshContent() {
    loadPaging(cp.innerText, 'False');
}


function loadRPName(RAID) { 
    var res = callSyncAth("GET", REPOSITORY.server + `sil/loadrpName/${RAID}`, "", errorPage);
    var data = JSON.parse(JSON.parse(res));
    if (data[0] != null)
        return data[0].NAME;
    return '';
}

function searchEvents(ctl) {
    if (ctl.value.length % 2 == 0 || ctl.value.length % 3 == 0) {
        const ps = parseInt(content.offsetHeight / 200);
        cp.innerText = 1;
        var data = JSON.stringify({
            AID: AID,
            FDTE: HT1.name,
            TDTE: HT2.name,
            KEY: ctl.value,
            CPAGE: 1,
            PAGESIZE: ps
        });
        callAsyncAth("POST", REPOSITORY.server + `sil/loadliveevents`, data, loadContent, errorPage);
    }
}

function register(EID) {
    progress.style.display = "block";
    PHL.innerText = AID + ' - ' + loadRPName(AID);

    var table = `<table style='width:100%;height:205px'>
                 <tr><td style='padding:5px;vertical-align:top'>
                 <table style='width:100%;height:100%'>
                    <tr>
                    <td><b>Where do you stay?</b> <select id='UD1' style='height:25px;margin-top:5px' onchange="loadbusroute()"></select></td>
                    </tr>
                    <tr>
                    <td><b>If day Scholar</b> <select id='UD2' style='height:25px;margin-top:5px'></select></td>
                    </tr>
                    <tr>
                    <td style='text-align:center'><button class='btn' style='width:75px;height:30px' onclick="registerevent('${EID}')">Submit</button></td>
                    </tr>
                 </table>
                 </td></tr></table>`;
    ifrmdata.innerHTML = table;
    var res = callSyncAth("GET", REPOSITORY.server + `sil/loadusercategory`, "", errorPage);
    loadDropdown('UD1', JSON.parse(JSON.parse(res)));

    var res = callSyncAth("GET", REPOSITORY.server + `sil/loaduserprofile/${AID}`, "", errorPage);
    var data = JSON.parse(JSON.parse(res));
    if (data.UP[0] != null) {
        UD1.value = data.UP[0].CCODE;
        if (data.UP[0].RID != "") {
            loadbusroute();
            UD2.value = data.UP[0].RID;
        }
    }

    progress.style.display = "none";

    popupwindow.style.width = "500px";
    popupwindow.style.height = "250px";
    popup.style.display = "block";
    var resp = confirm("Click OK to confirm your registration");
    if (resp == false)
       return;

    progress.style.display = "block";
    var res = callSyncAth("POST", REPOSITORY.server + `sil/registerevents/${EID}/${AID}`, "", errorPage);
    var rdata = JSON.parse(JSON.parse(res));
    window.parent.showToast(rdata.ID, rdata.MSG);
    progress.style.display = "none";
    loadPaging(cp.innerText, 'False');
}

function registerevent(EID) {
    UD1.style.border = "";
    UD2.style.border = "";
    if (UD1.value == "") {
        UD1.style.border = "1px solid red";
        UD1.focus();
        return;
    }
    
    if (UD2.options.length > 1 && UD2.value == "") {
        UD2.style.border = "1px solid red";
        UD2.focus();
        return;
    }

    progress.style.display = "block";
    var data = JSON.stringify({
        UAID: AID,
        EID: EID,
        CCODE: UD1.value,
        RID: UD2.value
    });
    var res = callSyncAth("POST", REPOSITORY.server + `sil/registerevents`, data, errorPage);
    var rdata = JSON.parse(JSON.parse(res));
    window.parent.showToast(rdata.ID, rdata.MSG);
    progress.style.display = "none";
    loadPaging(cp.innerText, 'False');
    closePopup();
}

function loadbusroute() {
    progress.style.display = "block";
    var res = callSyncAth("GET", REPOSITORY.server + `sil/loadbusroute/${UD1.value}`, "", errorPage);
    loadDropdown('UD2', JSON.parse(JSON.parse(res)));
    progress.style.display = "none";
}

function cancelRegistration(EID) {
    var resp = confirm("Click OK to confirm the cancellation");
    if (resp == false)
        return;

    progress.style.display = "block";
    var res = callSyncAth("POST", REPOSITORY.server + `sil/cancelreg/${EID}/${AID}`, "", errorPage);
    var rdata = JSON.parse(JSON.parse(res));
    window.parent.showToast(rdata.ID, rdata.MSG);
    progress.style.display = "none";
    loadPaging(cp.innerText, 'False');
}

function closePopup() {
    ifrmdata.innerHTML = "";
    popup.style.display = "none";
}

function viewSchedule(EID) {
    progress.style.display = "block";
    PHL.innerText = "Event Schedule";
    var res = callSyncAth("GET", REPOSITORY.server + `sil/vieweventschedule/${EID}`, "", errorPage);
    var data = JSON.parse(JSON.parse(res));
    var table = `<div style='width:calc(100% - 10px);height:345px;padding:5px;'>
                    <div style='width:100%;height:30px;line-height:30px;color:orangered;font-size:10pt'><b>${data.EVT[0] != null ? data.EVT[0].ENAME : ''}</b></div>
                    <div style='width:calc(100% - 5px);height:15px;padding-top:10px'><b>Event Schedule</b></div>
                    <div style='width:100%;height:290px;overflow:auto'>
                    <table class='ctbl'>
                    <thead><tr>
                        <th style='width:35px'>S#</th>
                        <th style='width:50px'>Slot#</th>
                        <th style='width:100px'>ScheduleDate</th>
                        <th style='width:100px'>ScheduleDay</th>
                        <th style='width:100px'>ScheduleTime</th>
                        <th style='width:150px'>Venue</th>
                        <th colspan='2'>Resource Person</th>
                    </tr></thead>`;
    for (var x in data.SCH) {
        var d = new Date(data.SCH[x].DTE);
        var rpndata = "";
        if (data.SCH[x].RPTYPE == 1) {
            var res = callSyncAth("GET", REPOSITORY.server + `sil/loadrpName/${data.SCH[x].RPNAME}`, "", errorPage);
            rpndata = JSON.parse(JSON.parse(res));
        }
        table += `<tr>
                    <td style='text-align:center'>${data.SCH[x].ID}</td>
                    <td style='text-align:center'>${data.SCH[x].SLOT}</td>
                    <td style='text-align:center'>${data.SCH[x].VDTE}</td>
                    <td style='text-align:center'>${days[d.getDay()]}</td>
                    <td>${data.SCH[x].HOURS}</td>
                    <td>${data.SCH[x].VNAME}</td>
                    <td style='text-align:center;width:25px'>${data.SCH[x].RPTYPE == 1 ? `INT` : `EXT`}</td>
                    <td>${data.SCH[x].RPTYPE == 2 ? data.SCH[x].RPNAME : data.SCH[x].RPNAME + " - " + rpndata[0].NAME}</td>
                  </tr>`
    }
    table += `</table></div></div>`;
    ifrmdata.innerHTML = table;
    popupwindow.style.width = "800px";
    popupwindow.style.height = "400px";
    popup.style.display = "block";
    progress.style.display = "none";
}

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function getNextMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff + 7));
}

function convertDate(dte) {
    d = new Date(dte);
    dt = d.getDate();
    mn = d.getMonth();
    mn++;
    yy = d.getFullYear();
    dt = (dt < 10) ? "0" + dt : dt;
    mn = (mn < 10) ? "0" + mn : mn;
    return mn + "/" + dt + "/" + yy;
}

function convertDateIST(dte) {
    d = new Date(dte);
    dt = d.getDate();
    mn = d.getMonth();
    mn++;
    yy = d.getFullYear();
    dt = (dt < 10) ? "0" + dt : dt;
    mn = (mn < 10) ? "0" + mn : mn;
    return dt + "/" + mn + "/" + yy;
}

function dateClick(CTL, TB) {
    var TB = document.getElementById(TB);
    var ODTE = TB.name;
    var ODTEV = TB.value;

    d = new Date(CTL.value);
    dt = d.getDate();
    mn = d.getMonth();
    mn++;
    yy = d.getFullYear();
    dt = (dt < 10) ? "0" + dt : dt;
    mn = (mn < 10) ? "0" + mn : mn;
    TB.value = dt + "/" + mn + "/" + yy;
    TB.name = mn + "/" + dt + "/" + yy;

    FDTE = new Date(HT1.name);
    TDTE = new Date(HT2.name);
    if (FDTE > TDTE) {
        alert("FROM date must be lesser than TO date");
        TB.name = ODTE;
        TB.value = ODTEV;
        return;
    }
    searchContent();
}