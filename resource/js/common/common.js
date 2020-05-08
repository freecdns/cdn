/**
 * 命名空间
 */
jQuery.namespace = function() {
	var a = arguments, o = null, i, j, d, rt;
	for (i = 0; i < a.length; ++i) {
		d = a[i].split(".");
		rt = d[0];
		eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = '
				+ rt + ';');
		for (j = 1; j < d.length; ++j) {
			o[d[j]] = o[d[j]] || {};
			o = o[d[j]];
		}
	}
};


/**
 * 公共方法
 */
var Util = {
	getColor : function(color){
		switch(color){
		case 'warning':
			return '#f9a938';
		case 'error':
			return '#ff8282';
		case 'success':
			return '#5cb85c';
		case 'info':
			return '#72dfff';
		case 'disabled':
			return '#b19595';
		default:
			return '#72dfff';
		}
	},
	/**
	 * 与服务端交互
	 * 
	 * @param data
	 */
	ajax : function(data) {
		if (!data || !data.url) {
			Msg.warning({
				content : 'ajax方法中尚未配置url请求地址。'
			});
			return;
		}
		var loading = "";
		$.ajax({
			type : data.method || "POST",
			url : contextPath + data.url,
			cache : false,
			async : data.async == undefined ? true : data.async,
			data : JSON.stringify(data.param || {}),
			dataType : data.dataType || "json",
			contentType : 'application/json;charset=utf-8',
			success : function(result) {
				if (data.success && typeof (data.success) == "function") {
					data.success(result);
				}
			},
			error : function(err) {
				//如果返回的是页面，则写入这个页面,如果状态是200，则是session超时，需要刷新
				/*if(err.responseText.indexOf("<html")>0){
					if (err.status == 200){
						window.location.reload();
					}else{
						document.querySelector('html').innerHTML = err.responseText;
					}
					return;
				}*/
				if (err.status == 200 && err.statusText == "OK" && data.success
						&& typeof (data.success) == "function") {
					data.success(err.responseText);
					return;
				}
				if (data.error && typeof (data.error) == "function") {
					data.error(err);
				}
			},
			beforeSend : function() {
				// 发送请求之前提交按钮显示loading
				if (data.submitButton) {
					$(data.submitButton).button("loading");
				}
				// 发送请求之前显示loading
				if (data.loading) {
					loading = Msg.loading();
				}
			},
			complete : function(xhr) {
				if (data.submitButton) {
					$(data.submitButton).button("reset");
				}
				if (loading)
					Msg.close(loading);
			}
		});
	},
	/**
	 * 渲染模板,清空之前的内容
	 * 
	 * @param param
	 */
	renderTemplet : function(param) {
		$("#" + param.containerId).html(template(param.templetId, {
			'data' : param.data
		}));
	},
	appendTemplet : function(param) {
		$("#" + param.containerId).append(template(param.templetId, {
			'data' : param.data
		}));
	},
	/**
	 * 页面Tab切换(pt:页面TAB展示；ptc页面TAB内容;lp页数；type 类型) 向浏览器中放入Hash值
	 */
	setHash : function(hash) {
		// 判断hash中是否有go的跳转
		var act = this.getHash(location.hash, 'act');
		// 如果传进来的hash中没有跳转地址，则默认加上URL地址上默认的
		if (hash.indexOf("act=") == -1 && act) {
			hash += "&act=" + act;
		}
		window.location.hash = hash;
	},
	/**
	 * 替换指定hash值
	 */
	replaceHash : function(paramName, paramValue) {
		var hash = window.location.hash;
		for (var i = 0; i < arguments.length; i += 2) {
			paramName = arguments[i];
			paramValue = arguments[i + 1];
			var p = hash.match(new RegExp(paramName + "=([^\&]*)", "i"));
			if (p != null) {
				hash = hash.replace(p[0], paramName + "=" + paramValue);
			} else {
				var s = paramName + "=" + paramValue;
				if (hash.length > 0) {
					hash += "&" + s;
				} else {
					hash += s;
				}
			}
		}

		window.location.hash = hash;
	},
	/**
	 * 截取参数方法，hash：截取的字符串，name：截取的参数名，nvl：该参数不存在时的返回值
	 */
	getHash : function(hash, name, nvl) {
		if (!nvl) {
			nvl = "";
		}
		var svalue = null;
		var val = (hash + "").split("#")[1];
		var arr = (val + "").split("&");
		$.each(arr, function() {
			var equalsindex = (this + "").indexOf("=");
			var ky = (this + "").substring(0, equalsindex);
			if (ky == name) {
				svalue = (this + "").substring(equalsindex + 1);
			}
		});
		if (svalue == null) {
			return nvl;
		} else {
			try {
				return decodeURIComponent(svalue);
			} catch (e) {
				return svalue;
			}
		}
	},
	/**
	 * 判断对象是否为空
	 * 
	 * @param {Object}
	 *            v
	 * @return {Boolean} 不为空返回true，否则返回false。
	 */
	isNotEmpty : function(v) {
		if (typeof (v) == "object") {
			if ($.isEmptyObject(v)) {
				return false;
			} else {
				return true;
			}
		} else {
			if (v == null || typeof (v) == 'undefined' || v == ""
					|| v == "unknown") {
				return false;
			} else {
				return true;
			}
		}
	},
	isIE : function() {
		if (!!window.ActiveXObject || "ActiveXObject" in window)
			return true;
		else
			return false;
	},
	isWindows : function() {
		if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
			return false;
		} else {
			return true;
		}
	},
	getTimestamp : function() {
		var time = new Date();
		return time.getTime();
	},
	changeValiCodeIMG : function(imgboxId) {
		$("#" + imgboxId).attr("src",
				contextPath + "/getValidateCode?" + this.getTimestamp());
	},
	sendValidateCodeSMSButtonChange : function(obj) {
		var countdown = 60;
		settime(obj);
		function settime(obj) {
			if (countdown == 0) {
				$(obj).attr("disabled", false);
				$(obj).text("获取短信验证码");
				countdown = 60;
				return;
			} else {
				$(obj).attr("disabled", true);
				$(obj).text(countdown + "秒后重新获取");
				countdown--;
			}
			setTimeout(function() {
				settime(obj)
			}, 1000);
		}
	},
	clearCondition : function(objId) {
		$("#" + objId).find('input[type="text"]').each(function() {
			$(this).val("");
		});
		$("#" + objId).find('input[type="number"]').each(function() {
			$(this).val("");
		});
		$("#" + objId).find('select').each(function() {
			$(this).selectpicker('val', '');
			$(this).selectpicker('refresh');
		});
	},
	getFormData : function(formId) {
		var result={};
		var inputs=$('#'+formId).find('input');
		var selects=$('#'+formId).find('select');

		inputs.each(function() {
			var id=$(this).attr('id');
			var name=$(this).attr('name');
			var val="";
			if($(this).hasClass('modelSelect')){
				var data=ModelSelect.getInputData(id);
				if(data){
					var key=-1;// 0对应顶级，所以type肯定会大于-1，赋值的时候也会赋予type=-1
					$.each(data, function(index, value) {
						if(parseInt(index)>parseInt(key)) key=index;
					})
					val=data[key];
				}
			}else{
				val=$(this).val();
			}
			if(name){
				result[name]=val;
			}
			
		});
		selects.each(function() {
			result[$(this).attr('name')]=$(this).val();
		});
		return result;
	},
	setFormData : function(formId,formData) {
		var inputs=$('#'+formId).find('input');
		var selects=$('#'+formId).find('select');
		inputs.each(function() {
			var id=$(this).attr('id');
			var name=$(this).attr('name');
			var val=formData[name];
			if(val){
				if($(this).hasClass('modelSelect')){
					// 0对应顶级，所以type肯定会大于-1，赋值的时候也会赋予type=-1
					ModelSelect.setInputData(id,'-1',val);
					$(this).val(formData[name+'_name']);
				}else{
					$(this).val(val);
				}
			}
		});
		selects.each(function() {
			var name=$(this).attr('name');
			var val=formData[name];
			if(val){
				$(this).selectpicker('val',val);
			}else if(val == '0'){
				$(this).selectpicker('val','0');
			}
		});
	},
	calculateUserInfoLayerSize : function(isWindows,clientWidth,clientHeight,barHeight){
		var area=[];
		if(isWindows){
			var widthWindows=400;
			var heightWindows=400+barHeight;
			area=[ widthWindows+'px', heightWindows+'px' ]
		}else{
			if(clientWidth>clientHeight){
				var base=parseInt(clientHeight)*0.9;
				var width=base-barHeight;
				area=[ width+'px', base+'px' ];
			}else{
				var base=parseInt(clientWidth)*0.9;
				var height=base+barHeight;
				area=[ base+'px', height+'px' ];
			}
		}
		return area;
	},
	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
	// yyyy-MM-dd hh:mm:ss
	dateFormat : function (date,fmt) { 
	          var o = {
	             "M+": date.getMonth() + 1, // 月份
	             "d+": date.getDate(), // 日
	             "h+": date.getHours(), // 小时
	             "m+": date.getMinutes(), // 分
	             "s+": date.getSeconds(), // 秒
	             "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
	             "S": date.getMilliseconds() // 毫秒
	         };
	         if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	         	for (var k in o)
	             if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	         return fmt;
	     }
};
var Msg = {
	close : function(index) {
		layer.close(index);
	},
	closeAll : function(object) {
		if (object) {
			layer.closeAll(object);
		} else {
			layer.closeAll();
		}
	},
	loading : function() {
		return layer.load(2);
	},
	createMessageBox : function(msg, style) {
		var optipn = {
			type : 0,
			shadeClose : true,
			title : false,
			btn : false
		};
		$.each(msg, function(index, value) {
			optipn[index] = value;
		})
		optipn.success=function(layero,index){
			layero.find('.layui-layer-content').addClass(style); 
		}
		var index = layer.open(optipn);
		return index;
	},
	warning : function(msg) {
		var index = this.createMessageBox(msg, 'alert-warning');
		return index;
	},
	error : function(msg) {
		var index = this.createMessageBox(msg, 'alert-danger');
		return index;
	},
	success : function(msg) {
		var index = this.createMessageBox(msg, 'alert-success');
		return index;
	},
	info : function(msg) {
		var index = this.createMessageBox(msg, 'alert-info');
		return index;
	},
	confirm : function(msg,doing) {
		layer.confirm(msg, {icon: 3, title:'确认'}, function(index){
			  layer.close(index);
			  if(doing && typeof (doing) == "function") {
				  doing();
			  }			  
			  
		});
	}
};
var Validate = {
	isCardNo : function(card) {
		var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		return pattern.test(card);
	},
	isPhoneNo : function(phone) {
		var pattern = /^1[3456789]\d{9}$/;
		return pattern.test(phone);
	},
	isChinaName : function(name) {
		var pattern = /^[\u4E00-\u9FA5]{1,6}$/;
		return pattern.test(name);
	},
	isImage : function(fileType) {
		var pattern = /image\/\w+/;
		return pattern.test(fileType);
	},
	isEmpty : function(a) {
		if (undefined == a || null == a || "" == a) {
			return true;
		}
		return false;
	},
	validateForm : function(formId) {
		var result=true;
		var inputs=$('#'+formId).find('input');
		var selects=$('#'+formId).find('select');
		selects.each(function() {
			inputs.push(this);
		});
		inputs.each(function() {
			if($(this).attr('required')=='required'){
				if($(this).val()){
					$("#error_"+$(this).attr('id')).text("");
				}else{
					$("#error_"+$(this).attr('id')).text("必填项");
					result=false;
				}
			}
		});
		return result;
	}

};
// showType ==
// 'query'为查询模式，展开Model框时，清空显示数据和临时数据，每次选择节点都会刷新显示数据和临时数据。最终结果在临时数据里面取；
// 如果是编辑模式showType ==
// 'edit'，直到最后一个节点选择完毕，显示数据才会改变，临时数据（selectDataTemp）保存到正式数据（selectData）里面，
// 取数据的时候要在正式数据（selectData）里面取；
var ModelSelect = {
	getInputId : function($obj) {
		var containerId = $obj.parent().parent().parent().parent().attr('id');
		var inputId = containerId.replace('_modelSelect', '');
		return inputId;
	},
	getModelSelectRowData : function($obj) {
		var index = $obj.data('index');
		var inputId = this.getInputId($obj);
		var data = $('#' + inputId).data('reginCodeData');
		return data[index];
	},
	getInputData : function(inputId) {
		var showType = $('#' + inputId).data('showtype');
		if (showType == 'query'){
			return $('#' + inputId).data('selectDataTemp');
		}else{
			return $('#' + inputId).data('selectData');
		}
	},
	setInputData : function(inputId,type,value) {
		// 临时数据
		var inputDataTemp = $('#' + inputId).data('selectDataTemp');
		var selectDataTemp = inputDataTemp || {};
		selectDataTemp[type] = value;
		$('#' + inputId).data('selectDataTemp', selectDataTemp);
		// 正式数据
		var inputData = $('#' + inputId).data('selectData');
		var selectData = inputData || {};
		selectData[type] = value;
		$('#' + inputId).data('selectData', selectData);
	},
	clearInputData : function(inputId) {
		// 临时数据
		$('#' + inputId).data('selectDataTemp', {});
		// 正式数据
		$('#' + inputId).data('selectData', {});
	},
	modelSelectRowClick : function() {
		var rowData = ModelSelect.getModelSelectRowData($(this));
		var inputId = ModelSelect.getInputId($(this));
		var showType = $('#' + inputId).data('showtype');
		// 如果是查询模式，点击一个地区，则input框改变一下，否则到最后一个节点才会改变
		if (showType == 'query'){
			$('#' + inputId).val(rowData.name);
		}
		var inputData = $('#' + inputId).data('selectDataTemp');
		var selectDataTemp = inputData || {};
		selectDataTemp[rowData.type] = rowData.id_pk;
		$('#' + inputId).data('selectDataTemp', selectDataTemp);
		if (showType == 'query' && rowData.show_next_query == 1) {
			ModelSelect.fillingReginCodeData(inputId, rowData.id_pk);
		} else if (showType != 'query' && parseInt(rowData.num_child) > 0) {
			ModelSelect.fillingReginCodeData(inputId, rowData.id_pk);
		} else {
			$('#' + inputId).data('selectData', selectDataTemp);
			$('#' + inputId).val(rowData.name);
			Msg.closeAll();
		}
	},
	fillingReginCodeData : function(inputId, parent_id) {
		var url = $('#' + inputId).data('url');
		Util.ajax({
			url : url, 
			param : {
				parent_id : parent_id
			},
			success : function(result) {
				Util.renderTemplet({
					templetId : 'modelSelectBox_templet',
					containerId : inputId + "_modelSelect",
					data : result
				});
				$('#' + inputId).data('reginCodeData', result);
				$('.model-select-td').on("click", ModelSelect.modelSelectRowClick);
			},
			error : function(err) {
			}
		});
	},
	modelSelectShow : function() {
		var id_this = $(this).attr('id');
		$('#' + id_this).data('selectDataTemp', {});
		var showType = $('#' + id_this).data('showtype');
		// 如果是查询模式，展开Model框就清空数据
		if (showType == 'query'){
			$('#' + id_this).val('');
		}
		var height = isWindows ? '400px' : '80%';
		layer.open({
			type : 0,
			area : [ 'auto', height ],
			btn : false,
			scrollbar : false,
			shadeClose : true,
			title : false,
			content : '<div id="' + id_this + '_modelSelect"></div>'
		});
		ModelSelect.fillingReginCodeData(id_this, '');
	}

};
var TableUtil = {
		bootstrapTable : function(parameters){
			$('#'+parameters.tableId).bootstrapTable({
		         url: contextPath+parameters.url,         						//请求后台的URL（*）
		         method: parameters.method||'post',                      		//请求方式（*）
		         toolbar: parameters.toolbar||'#toolbar',                		//工具按钮用哪个容器
		         striped: parameters.striped||true,                      		//是否显示行间隔色
		         cache: parameters.cache||false,                       			//是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		         pagination: parameters.pagination||true,                   	//是否显示分页（*）
		         sortable: parameters.sortable||true,  							//是否启用排序
		         sortName : parameters.sortName||'',							//排序列名称
		         sortOrder: parameters.sortOrder||"asc",                   		//排序方式
		         queryParams: parameters.queryParams,							//传递参数（*）
		         sidePagination: parameters.sidePagination||"server",           //分页方式：client客户端分页，server服务端分页（*）
		         pageNumber:parameters.pageNumber||1,                       	//初始化加载第一页，默认第一页
		         pageSize: parameters.pageSize||10,                       		//每页的记录行数（*）
		         pageList: parameters.pageList||[10, 25, 50, 100],        		//可供选择的每页的行数（*）
		         search: parameters.search||false,                       		//是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
		         strictSearch: parameters.strictSearch||true,
		         showColumns: parameters.showColumns||true,                  	//是否显示所有的列
		         showRefresh: parameters.showRefresh||true,                  	//是否显示刷新按钮
		         minimumCountColumns: parameters.minimumCountColumns||2,        //最少允许的列数
		         clickToSelect: parameters.clickToSelect||true,                	//是否启用点击选中行
		         height: parameters.height,                        				//行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
		         uniqueId: parameters.uniqueId||"id_pk",                     	//每一行的唯一标识，一般为主键列
		         showToggle:parameters.showToggle||false,                    	//是否显示详细视图和列表视图的切换按钮
		         cardView: parameters.cardView||false,            				//是否显示详细视图
		         detailView: parameters.detailView||false,						//是否显示父子表
		         columns: parameters.columns||[],
		         onLoadSuccess : parameters.onLoadSuccess
		     });
		}
};
var MathUtil = {
		toPositiveFloat : function(item,radix) {
			var a=item.value.trim();
			if(a==''||'NaN'==a||isNaN(a)){
				a='0';
			}
			item.value=Math.abs(parseFloat(a)).toFixed(radix);
		},
		toFloat : function(item,radix) {
			var a=item.value.trim();
			if(a==''||'NaN'==a||isNaN(a)){
				a='0';
			}
			item.value=parseFloat(a).toFixed(radix);
		},
		// 除法
		accDiv : function(arg1, arg2) {
			var t1 = 0, t2 = 0, r1, r2;
			try {
				t1 = arg1.toString().split(".")[1].length;
			} catch (e) {
			}
			try {
				t2 = arg2.toString().split(".")[1].length;
			} catch (e) {
			}
			with (Math) {
				r1 = Number(arg1.toString().replace(".", ""));
				r2 = Number(arg2.toString().replace(".", ""));
				return MathUtil.accMul((r1 / r2), pow(10, t2 - t1));
			}
		},
		// 乘法
		accMul : function(arg1, arg2) {
			var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
			try {
				m += s1.split(".")[1].length;
			} catch (e) {
			}
			try {
				m += s2.split(".")[1].length;
			} catch (e) {
			}
			return Number(s1.replace(".", "")) * Number(s2.replace(".", ""))/ Math.pow(10, m);
		},
		// 加法
		accAdd : function(arg1, arg2) {
			var r1, r2, m;
			try {
				r1 = arg1.toString().split(".")[1].length;
			} catch (e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split(".")[1].length;
			} catch (e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			return (arg1 * m + arg2 * m) / m;
		},
		// 减法
		accSub : function(arg1, arg2) {
			var r1, r2, m, n;
			try {
				r1 = arg1.toString().split(".")[1].length;
			} catch (e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split(".")[1].length;
			} catch (e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			n = (r1 >= r2) ? r1 : r2;
			return ((arg1 * m - arg2 * m) / m).toFixed(n);
		},
		// 绝对值
		accAbs : function(arg1) {
			var value;
			try{
				value = Math.abs(arg1);
			}catch(e){
				value = 0;
			}
			return value;
		},
		getRandomNum : function(minNum,maxNum){ 
			// Math.floor(Math.random()*(max-min+1)+min);
		    switch(arguments.length){ 
		        case 1: 
		            return parseInt(Math.random()*minNum+1,10); 
		        break; 
		        case 2: 
		            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
		        break; 
		            default: 
		                return 0; 
		            break; 
		    } 
		}
};
var OSSUtil = {
		dataURLtoBlob : function(dataurl) {
			var arr = dataurl.split(','),    
			mime = arr[0].match(/:(.*?);/)[1],    
			bstr = atob(arr[1]),    
			n = bstr.length,    
			u8arr = new Uint8Array(n);    
			while (n--) {        
				u8arr[n] = bstr.charCodeAt(n);    
				}    
			return new Blob([u8arr], {        
				type: mime    
				});
		},
		isOSSPhoto : function(url,oss_storage_folderName) {
			var s=url.split("/");
			var folder=s[s.length-2];
			if(oss_storage_folderName==folder){
				return true;
			}
			return false;
		},
		transformImgurl : function(oss_host,oss_storage_folderName,imgurl,is_develop) {
			if(is_develop){
				return contextPath+'/resource/image/common/test2.jpg';
			}
			var a=imgurl.substring(0,4);
			if('http'==a){
				return imgurl;
			}
			return oss_host+'/'+oss_storage_folderName+'/'+imgurl;
		},
		uploadFileToOSS : function(oss_storage_folderName,fileName,file) {
			var token=OSSUtil.getOSSToken();
			if(token){
		            var fullFlieName=oss_storage_folderName+"/"+fileName;
					var client = new OSS({
						  region: token.region,
						  accessKeyId: token.AKid,
						  accessKeySecret:token.AKs,
						  stsToken:token.stsToken,
						  bucket: token.bucket
						});
					
					// 异步
					client.multipartUpload(fullFlieName, file).then(function (result) {
			          }).catch(function (err) {
			        	  Msg.warning({content:'图片上传失败！'});
			          });
			    }
		},
		deleteFileFromOSS : function(filename) {
			var token=OSSUtil.getOSSToken();
			if(token){
				var client = new OSS.Wrapper({
					  region: token.region,
					  accessKeyId: token.AKid,
					  accessKeySecret:token.AKs,
					  stsToken:token.stsToken,
					  bucket: token.bucket
					});
				
				client.deleteMulti([filename]).then(function (result) {
					return true;
					}).catch(function (err) {
						Msg.warning({content:'删除失败！'});
		              return false;
		          });
			}
		},
		getOSSToken : function() {
			var ossToken=$.cookie("OSSToken");
			if(ossToken){
				try {
					ossToken=JSON.parse(ossToken);
					var createTime=ossToken.createTime;
					var ableTime=MathUtil.accMul(ossToken.durationSeconds, 800);// 取有效期的80%，单位是秒，转换成毫秒*1000，所以是*800.
					var expiredTime=new Date(MathUtil.accAdd(createTime,ableTime));
					if(expiredTime<new Date()){
						ossToken=OSSUtil.newOSSToken();
					}
				} catch (e) {
					console.log("OSSToken解析失败!!!");
					console.log(e);
					return false;
				}
			}else{
				ossToken=OSSUtil.newOSSToken();
			}
			
			return ossToken;
		},
		newOSSToken : function(){
			var token=OSSUtil.getOSSTokenFromServer();
			if(token){
				$.cookie("OSSToken",JSON.stringify(token), { expires: 1});
			}
			return token;
		},
		getOSSTokenFromServer : function(){
			var res=false;
			Util.ajax({
				url : "/commonserve/getOSSSign",
				async: false,
				param : {},
				success : function(data) {
					if(data.code==0){
						  Msg.warning({content:'鉴权参数请求失败!'});
					  }else{
						  data['createTime']=new Date().getTime();
						  res= data;
					  }
				},
				error : function(err) {
					Msg.warning({content:'鉴权参数请求失败!'});
				}
			});
			return res;
		}
};
var COSUtil = {
		dataURLtoBlob : function(dataurl) {
			var arr = dataurl.split(','),    
			mime = arr[0].match(/:(.*?);/)[1],    
			bstr = atob(arr[1]),    
			n = bstr.length,    
			u8arr = new Uint8Array(n);    
			while (n--) {        
				u8arr[n] = bstr.charCodeAt(n);    
				}    
			return new Blob([u8arr], {        
				type: mime    
				});
		},
		transformImgurl : function(cos_host,imgurl,is_develop) {
			if(is_develop){
				return contextPath+'/resource/image/common/test2.jpg';
			}
			var a = imgurl.substring(0,4);
			if('http' == a){
				return imgurl;
			}
			if(cos_host.charAt(cos_host.length-1) == '/' || imgurl.charAt(0) == '/'){
				return cos_host + imgurl;
			}else{
				return cos_host + "/" + imgurl;
			}
			
		}
};
var rechargeUtil = {
		showRechargeAlertModel : function(data){
			// Msg.warning({content:'非会员每日只有'+data.num+'次机会呦！'});
			// 基本尺寸
			var width=400;
			var height=300;
			if(clientHeight<height){
				height=parseInt(clientHeight)*0.9;
			}
			if(clientWidth<width){
				width=parseInt(clientWidth)*0.9;
			}
			
			var area=[ width+'px', height+'px' ];
			
			var layerOption={
					type : 0,
					area : area,
					scrollbar : false,
					shadeClose : true,
					title : false,
					content : '<div style="width:100%;height:100%;overflow:hidden;" id="div_helloLimitModel"></div>',
					btn : false,
					success : function(layero){
						Util.renderTemplet({
							templetId : 'rechargePopupModel_templet',
							containerId : 'div_helloLimitModel',
							data :data
						});
					}
				};
			layer.open(layerOption);
		}
};

var paginationUtil = {
		createHtml : function(pageNow,totalPage,pagesPrevious,pagesSuffix){
			if(totalPage == 0){
				return '';
			}
			let Previous = pageNow - 1;
			let Next = pageNow + 1;
					
			let html = '<div class="can-not-select">';
			html += '<div style="height: 34px; float: right; margin: 10px 0px 0px 10px; vertical-align: middle; line-height: 34px;">';
			html += '<div class="pull-left">共'+totalPage+'页</div>';
			html += '<div class="pull-left" style="margin-left: 10px;">到</div>';
			html += '<input id="pageJumpInput" type="txt" style="width: 60px; margin: 0 6px;"class="form-control pull-left">';
			html += '<div class="pull-left">页</div>';
			html += '</div>';
			html += '<nav aria-label="Page navigation" style="float: right;">';
			html += '<ul class="pagination" style="margin: 10px 0px 0px 0px;">';
			html += '<li class="cursor-pointer '+(pageNow == 1?'disabled':'')+'" pagenum='+Previous+'><span aria-hidden="true">&laquo;</span></li>';
			for(let i = pageNow - pagesPrevious;i < pageNow + pagesSuffix + 1;i++){
				html += '<li class="cursor-pointer '+(pageNow == i?'active':'')+'" pagenum='+i+'><span>'+i+'</span></li>';
			}
			html += '<li class="cursor-pointer '+(pageNow == totalPage?'disabled':'')+'" pagenum='+Next+'><span aria-hidden="true">&raquo;</span></li>';
			html += '</ul>';
			html += '</nav>';
			html += '</div>';
			return html;
		},
		paginationLoad :function(containerId,pageNow,totalPage,callback){
			let clientWidthThis = document.documentElement.clientWidth || document.body.clientWidth;
			let pagesShow = 5;
			if(clientWidthThis < 500){
				pagesShow = 1;
			}else if(clientWidthThis < 600){
				pagesShow = 3;
			}
			pagesShow = parseInt(pagesShow);
			totalPage = parseInt(totalPage);
			pageNow = parseInt(pageNow); 
			if(totalPage < pagesShow){
				pagesShow = totalPage;
			}
			
			let pagesPrevious = 0;
			let pagesSuffix = 0;
			
			let pagesPreviousNeed = parseInt(pagesShow/2);
			let pagesPreviousSurplus = pageNow - 1;
			if(pagesPreviousSurplus < pagesPreviousNeed){
				pagesPrevious = pagesPreviousSurplus;
			}else{
				pagesPrevious = pagesPreviousNeed;
			}
			
			let pagesSuffixNeed = pagesShow - pagesPreviousNeed - 1;
			let pagesSuffixSurplus = totalPage - pageNow;
			if(pagesSuffixSurplus < pagesSuffixNeed){
				pagesSuffix = pagesSuffixSurplus;
			}else{
				pagesSuffix = pagesSuffixNeed;
			}
			
			if((pagesPrevious + pagesSuffix + 1) < pagesShow){
				if((pagesPrevious < pagesPreviousNeed) && (pagesSuffix == pagesSuffixNeed)){
					pagesSuffix = pagesShow - pagesPrevious - 1;
					if((pagesSuffix + pageNow) > totalPage){
						pagesSuffix = totalPage - pageNow;
					}
				}else if((pagesPrevious == pagesPreviousNeed) && (pagesSuffix < pagesSuffixNeed)){
					pagesPrevious = pagesShow - pagesSuffix - 1;
					if((pageNow - pagesPrevious) < 1){
						pagesPrevious = pageNow - 1;
					}
				}else{
					pagesPrevious = pageNow - 1;
					pagesSuffix = totalPage - pageNow;
				}
			}
			
			$('#'+containerId).html(this.createHtml(pageNow,totalPage,pagesPrevious,pagesSuffix));
			
			$('.pagination li').unbind("click").click(function(){
				if(($(this).attr('class').indexOf('active') > -1) || ($(this).attr('class').indexOf('disabled') > -1)){
					return false;
				}
				let pageNew = $(this).attr('pagenum');
				paginationUtil.paginationLoad(containerId,pageNew,totalPage,callback);
				if (typeof callback === "function") {
	                callback(pageNew);
	            }
			});
			$('#pageJumpInput').change(function() {
				let pageNew = parseInt($(this).val());
				if('NaN'==(pageNew+'')){
					return false;
				}
				if(pageNew>totalPage){
					return false;
				}
				paginationUtil.paginationLoad(containerId,pageNew,totalPage,callback);
				if (typeof callback === "function") {
	                callback(pageNew);
	            }
			});
			
		}
		
}