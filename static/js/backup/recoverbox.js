function haveParentNode(snodes) {
	for(var i=0;i<snodes.length;i++){
		if (snodes[i].isParent){
			return true;
		}
	}
	return false;
}

function umPickNewDept(event, treeId, treeNode, clickFlag){
	var path = treeNode.path;
	$('#curpath').val(path);
	$('#file-table').bootstrapTable("destroy");
  	$('#file-table').bootstrapTable();
}

function getAsyncUrl(treeId, treeNode){
	var type = $('#curtype').val(),
		ip = $('#remoteip').val(),
		edata = $('#curedata').val(),
		baseurl = "/backup/recover/userdirs/",
		url = baseurl + '?recovertype=' + type + "&recoverip=" + ip + "&path=" + treeNode.path + "&edata=" + edata;
		// url = baseurl + '?recovertype=' + type + "&recoverip=" + ip + "&path=" + treeNode.name;
		return url;
}

var umsetting = {
	data : {
		simpleData : {
			enable : true,
			idKey : "did",
			pIdKey : "pdid",
			rootPId : -2
		}
	},
	callback : {
		onClick : umPickNewDept
	},
	async : {
			enable : true,
			url : getAsyncUrl,
			autoParam : ["path"],
			// otherParam: { "recovertype":'eee', 'recoverip': '222'},
			// otherParam: { "recovertype":$('#curtype').val(), 'recoverip': $('#remoteip').val()},
	}
};


function getUserDirs(){
	var url = "/backup/recover/userdirs/";
	var data = {'type' : 1};
	var r = ajaxRequest(url, data);
	
	if (!r['ret']){
//		toastr.error("获取组织信息失败！", "错误提示");
		myAlert('获取组织信息失败！',"error");
		return [];
	}	
	return r['data'];
}

function onClick (event, treeId, treeNode, clickFlag) {
  	var dept_id = treeNode.did;
  	var dept_name = treeNode.name;
  	var dsp = treeNode.description;
  	$('#kdept_id').val(dept_id);
  	$('#userinfo-table').bootstrapTable("destroy");
  	$('#userinfo-table').bootstrapTable();
  	$("#hidd_searchflag").val("");
  	$("#notice_messages").empty();
  	
}

var setting = {
	data : {
		simpleData : {
			enable : true,
			idKey : "did",
			pIdKey : "pdid",
			rootPId: -1
		},
		key: {
        	title: "description"
        }
	},
	
	view : {		
		showIcon : true,
	},
	callback: {
		onClick: onClick
	},
};

function genUserQueryParams(params){
	var newParams = {};
	var now = new Date();
					
	newParams['pageSize'] = params.limit;
	newParams['pageNumber'] = params.offset;
	newParams['deptID'] = $('#kdept_id').val();
	newParams['time'] = now.getTime();
	$("#btnOrderUser").removeAttr("disabled");
	$("#btnMatch").removeAttr("disabled");
	$("#btnBindHost").removeAttr("disabled");
	return newParams;
}

function genUserContentsParams(params){
	var newParams = {};
	var now = new Date();
					
	newParams['pageSize'] = params.limit;
	newParams['pageNumber'] = params.offset;
	newParams['path'] = $('#curpath').val();
	newParams['recovertype'] =$('#curtype').val();
	newParams['recoverip'] =$('#remoteip').val();
	newParams['edata'] =$('#curedata').val();
	newParams['time'] = now.getTime();
	return newParams
}

function usernameFormatters(value, row, index) {
 	var username=value;
 	if(username.length>15){
 		return "<span title='"+username+"'>"+username.substring(0,15)+"...</span>";
 	}else{
 		return "<span title='"+username+"'>"+username+"</span>";
 	}
 	
}

function filenameFormatters(value, row, index) {
	var filename = value;
	if (row.isParent){
		return '<div class="folder" style="float:left;margin-right:4px;"></div>' + "<span style='float:left;'>"+filename+"</span>"
	}else{
		return '<div class="normalfile" style="float:left;margin-right:4px;"></div>' + "<span style='float:left;'>"+filename+"</span>"
	}
}

function getSelectUids() {
	var tu = $("#boxinfo-table").bootstrapTable();
	var ids = $.map(tu.bootstrapTable("getSelections"), function(row) {
		return row.section_index;
	});
	return ids;
}

function getSelectPaths(){
	var tu = $("#file-table").bootstrapTable();
	var ids = $.map(tu.bootstrapTable("getSelections"), function(row) {
		return row.path;
	});
	return ids;
}

function getSelectSize(){
	var tu = $("#file-table").bootstrapTable();
	var ids = $.map(tu.bootstrapTable("getSelections"), function(row) {
		return row.sizecomp;
	});
	return ids;
}

$(document).ready(function() {
	
	$('#btnLocalRecover').bind('click', function() {
		var sltuids = getSelectUids();
		if (sltuids.length == 0) {
//			toastr.error("请选择要恢复的保险箱！", "错误提示");
			myAlert('请选择要恢复的保险箱！',"error");
			return false;
		}
		if (sltuids.length > 1) {
//			toastr.error("一次只能恢复的一个保险箱！", "错误提示");
			myAlert('一次只能恢复的一个保险箱！',"error");
			return false;
		}
		var suid = sltuids[0];
		
		$('#ksuid').val(suid);
		$('#curtype').val('local');
		var url = '/backup/recover/mountbk/';
		$(".shade .tip").text("正在挂载备份区，请稍后");
		$(".shade").show();
		$.ajax({
			type : "POST",
			url : url,
			dataType : 'json',
			timeout : 0,
			success : function(obj) {
				$(".shade").hide();
				if(obj['ret'] != true){
//					toastr.error("挂载失败，" + obj['errMsg'], "错误提示");
					myAlert('挂载失败，' + obj['errMsg'],"error");
					return false;
				}
				
				var mdeptnodes = [{'isParent':true,'name':'保险箱主目录', 'path':'common/sharebox'+suid}]
				$.fn.zTree.init($("#recovertre"), umsetting, mdeptnodes);
		
				$('#curpath').val('');
				$('#file-table').bootstrapTable("destroy");
				$('#file-table').bootstrapTable();
				$("#notice_messages").empty();
				$('#userMoveForm [name="bhErrMsg"]').html('');
				$('#newDeptname').val('');
				$('#moveUserModal').modal('show');
			},
			error : function() {
				$(".shade").hide();
//				toastr.error("挂载失败，服务器内部错误！", "错误提示");
				myAlert('挂载失败，服务器内部错误！',"error");
			}	
		});
	});
	
	$('#btnRemoteRecover').bind('click', function() {
		var sltuids = getSelectUids();
		if (sltuids.length == 0) {
//			toastr.error("请选择要恢复的保险箱！", "错误提示");
			myAlert('请选择要恢复的保险箱！',"error");
			return false;
		}
		if (sltuids.length > 1) {
//			toastr.error("一次只能恢复的一个保险箱！", "错误提示");
			myAlert('一次只能恢复的一个保险箱！',"error");
			return false;
		}
		
		var suid = sltuids[0];
		$('#ksuid').val(suid);
		$('#curtype').val('remote');
		// $('#remoteIPModal').modal('show');
		
		var url = '/backup/recover/testremotews/';
		var data = {'ip': $('#remoteip').val()}
		var rd = ajaxRequest(url, data)
		if (!rd['can_connect']){
			// $('#remoteIPModal').modal('hide');
//			toastr.error("远程webservice无法连接！", "错误提示");
			myAlert('远程webservice无法连接！',"error");
			return false;
		}
		// $('#remoteIPModal').modal('hide');
		var suid = $('#ksuid').val();
		var mdeptnodes = [{'isParent':true,'name':'保险箱主目录', 'path':'common/sharebox'+suid}]
		$.fn.zTree.init($("#recovertre"), umsetting, mdeptnodes);
		$('#curpath').val('');
		$('#file-table').bootstrapTable("destroy");
		$('#file-table').bootstrapTable();
		$("#notice_messages").empty();
		$('#userMoveForm [name="bhErrMsg"]').html('');
		$('#newDeptname').val('');
		$('#moveUserModal').modal('show');
	});	

	$('#moveUserModal').on('hide.bs.modal', function () {
		var url = '/backup/recover/umountbk/';
		ajaxRequest(url, {})
	})
	

	
	$('#btnRecoverOK').bind('click', function(){
		var url = '/backup/recover/rcvdata/';
		var paths = getSelectPaths();
		if (paths.length === 0){
			$('#bhErrMsg').html('请选择需要恢复的文件或文件夹');
			return false;
		}
		var size = getSelectSize();
		var jsonData = {
			'suid' : $('#ksuid').val(),
			'paths' : paths,
			'sizes' : size,
			'edata' : $('#curedata').val(),
			'recovertype':$('#curtype').val(),
			'recoverip':$('#remoteip').val()
		}
		
		$(".shade .tip").text("正在操作，请耐心等待");
		$(".shade").show();
		$.ajax({
			type : "POST",
			url : url,
			data : jsonData,
			dataType : 'json',
			timeout : 0,
			success : function(obj) {
				$('#moveUserModal').modal('hide');
				$(".shade").hide();
				if(obj['ret'] != true){
//					toastr.error(obj['errMsg'], "错误提示");
					myAlert(obj['errMsg'],"error");
					return false;
				}
//				toastr.success("恢复文件或文件夹成功!", "成功提示");
				myAlert('恢复文件或文件夹成功!',"info");
			},
			error : function() {
				$('#moveUserModal').modal('hide');
				$(".shade").hide();
//				toastr.error("服务器内部错误！", "错误提示");
				myAlert('服务器内部错误！',"error");
			}	
		});
	})
	
	var remoteForm = $("#remoteIPForm");
	remoteForm.validation();
	$('#btnRemoteIPOK').bind('click', function(){
		if(!remoteForm.validate()){
			return false;
		}
		
		var url = '/backup/recover/testremotews/';
		var data = {'ip': $('#remoteip').val()}
		var rd = ajaxRequest(url, data)
		if (!rd['can_connect']){
			$('#remoteIPModal').modal('hide');
//			toastr.error("远程webservice无法连接！", "错误提示");
			myAlert('远程webservice无法连接！',"error");
			return false;
		}
		$('#remoteIPModal').modal('hide');
		var suid = $('#ksuid').val();
		var mdeptnodes = [{'isParent':true,'name':'保险箱主目录', 'path':'common/sharebox'+suid}]
		$.fn.zTree.init($("#recovertre"), umsetting, mdeptnodes);
		$('#curpath').val('');
		$('#file-table').bootstrapTable("destroy");
		$('#file-table').bootstrapTable();
		$("#notice_messages").empty();
		$('#userMoveForm [name="bhErrMsg"]').html('');
		$('#newDeptname').val('');
		$('#moveUserModal').modal('show');
	})
	
});
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt/*,from*/) {
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++) {
			if ( from in this && this[from] == elt)
				return from;
		}
		return -1;
	};
}