// little tips:
		// 使用 void0可以防止一些极端情况下undefined不完全判断的情况，void0 实际上等同于undefined



		(function(global){
		// 除了数组和对象，还应该考虑枚举类型，字符串类型
			_this = this

			_this._obH = _obH = {}

			
			var obFunc = function(){};
			// 内部函数的原型,会使用它去嫁接原型等等


			// ---已测试
			function obRepeat(func, context, argcount){
				// 这个argcount似乎会自动计算？

				// 外部的return用来判断不同的功能函数，给予不同数量和功能的参数
				// 内部的return用来绑定当前的上下文

				if(context === null && context === undefined)
					context = _this

				// 迭代，执行函数
				if(argcount === 3){
					// 三个参数代表要改变原值的操作，所以应该是如下的参数形式
					return function(oldValue,index,oldObject) {
						return func.call(context,oldValue,index,oldObject)
					}
				} else {
					return func.apply(context,arguments)
				}
				
			}

			// 创建函数分配器
			var createAssigner = function(keysFunc,undefinedOnly) {
				// keyFunc 是每个key执行的函数
				return function(obj) {
					var length = arguments.length
					if(length < 2 || obj == null)
						return obj
					// 一个参数直接返回参数值
					for(var index = 1; index < length; index++) {
						var source = arguments[index]
						keys = keysFunc(source)
						// 多个参数，不去改变第一个，遍历后边的参数并进行操作
						for (var i = 0; i < 1; i++){
							// 判断处理之后如果是undefined则不进行操作回复到原来的数据
							var key = keys[i]
							if(!undefinedOnly || obj[key] == void 0)
								obj[key] = source[key]
						}
					}
					return obj
				}
			}

			// 创建继承自其它对象的对象
			var baseCreate = function (prototype) {
				// 根据原型参数派生对象
				if (!_obH.isObject(prototype)) {
					return {}
				} else if (Object.create) {
					return Object.create(prototype)
				}
				obFunc.prototype = prototype
				var result = new obFunc
				obFunc.prototype = null
				// var result = function(){}
				// result.prototype = new prototype

				// 看看两种方法有什么区别
				return result
			}

			// ---已测试
			var isArrayLike = function(collection) {
				var length = collection && collection.length
				// 如果这个array不为undefined且长度为大于0小于语言运算上限的情况即为数组
				return typeof length == 'number' && length >= 0 && length <= Math.pow(2,53)-1
			}

			// ---已测试
			_obH.iteratee = function(value, argcount, context){
				return obRepeat(value, context, argcount || 3) // 参数数目不限
			}

			// ---已测试
			_obH.isObject = function (obj) {
				if(obj instanceof Object === false){
					return false
				} else if(obj instanceof Object === true) {
					return true
				}
			}

			// ---已测试
			_obH.keys = function (obj) {
				// 此处还应该兼容枚举类型
				var keys = new Array
				if(!_obH.isObject(obj)) {
					return false
				} else if(_obH.isObject(obj)){
					for (var item in obj) {
						keys.push(item)
					}
					return keys
				}
			}

			//可以这样写一个别名
			// ---已测试
			_obH.each = _obH.forEach = function (obj,iteratee,context) {
				//  遍历并执行操作，但是操作不能改变原本的对象，除非操作引入对象参数，人为改变
				iteratee = obRepeat(iteratee,context,3)
				if(isArrayLike(obj)){
					for (var i = 0;i < obj.length;i++) {
						iteratee(obj[i], i, obj)     // func.call(this,obj[i])
						// 函数只提供原始值，索引，基本对象这三个参数接口
					}
				} else {
					var keys = _obH.keys(obj)
					for (var i = 0; i < keys.length; i++) {
						iteratee(obj[keys[i]], keys[i], obj)
					}
				}

				return obj
			}
			// obj代表处理的对象，iteratee代表迭代处理的函数（被称为迭代器），context是上下文，以下的操作函数都是这样

			// ---已测试
			_obH.map = function (obj, iteratee, context) {
				// 可以根据参数重要性排列顺序，比如变换数据基础是oldValue，所以就把oldValue放在第一位
				iteratee = _obH.iteratee(iteratee,this)
				if(isArrayLike(obj)){
					for (var i = 0;i < obj.length;i++) {
						obj[i] = iteratee(obj[i],i,obj)
					}
				} else {
					var keys = _obH.keys(obj)
					for (var i = 0;i < keys.length; i++){
						obj[i] = iteratee(obj[i],i,obj)
					}
				}
				return obj


			// ///////////////////////////////////////////////////可以像这样统一写成一个for
				// var keys = !isArrayLike(obj) && _.keys(obj),
			 //        length = (keys || obj).length,
			 //        results = Array(length);
			 //    for (var index = 0; index < length; index++) {
			 //      var currentKey = keys ? keys[index] : index;
			 //      results[index] = iteratee(obj[currentKey], currentKey, obj);
			 //    }
			 ////////////////////////////////////////////////////
			}

			// 功能是将数组内容内容通过指定函数合成为一个数据
			_obH.reduce = _obH.fold1 = _obH.inject = function(dir) {  
				//此reduce函数兼容了reduceright函数

			    // dir为间隔字符数
				// 迭代处理函数，将整个数组遍历处理出结果返回
				function iterator (obj,iteratee,memo,keys,index,length) {
					// 这个函数的参数都是假想需要的内容，具体内容可以在下方调用是具体实现
					for (;index >= 0&& index<length;index += dir) {
						var currentKey = keys? keys[index]:index
						// 该处理与map函数的处理方式大致一致
						memo = iteratee(memo,obj[currentKey],currentKey,obj) 
					}
					return memo
				}


				// 指代删除元素的顺序
				var res = function(obj,iteratee,memo,context) {
					iteratee = iteratee(iteratee,this)
					// obj是原对象，itertatee是处理函数，memo是结果res的初始值，context是上下文
					var keys = _obH.keys(obj)
					var length = (keys || obj).length 
					var index = dir > 0 ? 0 : keys || obj.length -1
					// 对象则取key数组的长度，数组取本身长度
					return iterator(obj, iteratee, memo, keys,index,length)
					// 参数obj为原对象，iteratee是原函数，memo是最终结果
				}
				return res
			}

			_obH.find = _obH.detect = function(obj,predicate,context) {
				// 返回第一个符合条件的值
				// obj 是进行查询的数组，predicate是条件函数，只返回第一个值
				var key = isArrayLike(obj)? _obH.findIndex(obj,predicate,context) : _obH.findKey(obj,predicate,context)
				if(key !== void 0 && key != -1) 
					return obj[key]
			}

			_obH.findKey = function(obj,predicate,context) {
				var iteratee = iteratee(predicate,this)
				if (isArrayLike(obj)) _obH.findIndex(obj,predicate,context)
				else {
					var keys = _obH.keys(obj)
					var i = 0
					for(var length = keys.length;i < length;i++) {
						if(iteratee(obj[keys[i]]))
							return keys[i]
					}
					if (i === keys.length) {
						return -1
					}

				}
			}

			_obH.findIndex = function(obj,predicate,context) {
				if (isArrayLike(obj)) {
					var i = 0
					for (var length = obj.length;i < length;i++) {
						if(iteratee(obj[i]))
							return i
					}
					if (i === obj.length)
						return -1
				} else {
					_obH.findKey(obj,predicate,context)
				}
			}

			_obH.filter = function(obj,predicate,context) {
				// 自发方法
				var key,res = new Array
				var clone = _obH.cloneDeep(obj)
				if(!isArrayLike(obj)){
					do {
						var key = findKey(clone,predicate,context)
						res.push(clone[key])
						obj.splice(key)
					} while(key !== -1) 

				}
				else {
					do {
						var key = findIndex(clone,predicate,context)
						res.push(clone[key])
						obj.splice(key)
					} while(key !== -1) 
				}

				// 源库方法
				// var res = []
				// predicate = iteratee(predicate,context)
				// _obH.each(obj,function(value,index,list) {
				// 	if (predicate(value,index,list))
				// 		res.push(value)
				// })	

				return res
			}

			// ---已测试
			_obH.cloneDeep = function(clone,obj,context) {
				if(isArrayLike(obj)){
					clone = []
					for(var i = 0;i < obj.length;i++) {
						clone[i] = obj[i]
					}
				} else {
					for(var item in obj) {
						if(typeof obj[item] !== 'object' || obj[item].length === 0) {
							clone[item] = obj[item]
						} else {
							clone[item] = {}
							_obH.cloneDeep(clone[item],obj[item],context)
						}
					}
				}
				return clone
			}

			_obH.reject = function(obj,predicate,context) {
				// 返回的结果与filter是相反的
				return _obH.filter(obj, _obH.negate(iteratee(predicate,-1)),context)
			}

			_obH.negate = function(predicate) {
				// 用来对操作函数取反的操作，如果符合条件输出false，不符合反而会输出true
				return !predicate.apply(this,arguments)
			}

			_obH.every = function(obj,predicate,context) {
				// 方法遍历每一个元素，整个数组都符合predicate规则返回true，否则返回false

				predicate = iteratee(predicate)
				var keys = isArrayLike(obj) && _obH.keys(obj)

				// 原生循环
				// 小技巧，在这里判断出是数组还是对象，两者进行遍历的区别只在于使用的key不同，所以可以不需要写两次循环
				// if(!isArrayLike(obj)) {
				// 	keys = _obH.keys(obj)
				// 	var i = 0
				// 	for (;i < keys.length;i++) {
				// 		if(!predicate(obj[keys[i]],keys[i],obj)) {
				// 			return false
				// 		}
				// 	}
				// 	if (i === keys.length)
				// 		return false
				// } else {
				// 	var i = 0
				// 	for (;i < keys.length;i++) {
				// 		if(!predicate(obj[i],i,obj)) {
				// 			return false
				// 		}
				// 	}
				// 	if (i === keys.length)
				// 		return false
				// }
				for(var i = 0;i < (keys || obj).length;i++) {
					var currentKey = keys ? key[i] : i
					if(!predicate(obj[currentKey],currentKey,obj))
						return false
				}
				return true


				// 使用内部each循环
				// var result
				// _obH.each(obj, function(n){
				// 	if(predicate(n) === false)
				// 		result = false
				// }, context)
				// return result


				// 一下类型的函数都可以使用以上三种形式
			}

			_obH.some = function(obj, predicate, context) {
			// 数组/对象中又一个元素满足条件即返回true
				predicate = iteratee(predicate)
				var keys = isArrayLike(obj) && _obH.keys(obj),
				length = keys? keys.length : obj.length

				for(var i= 0; i < length;i++) {
					var currentKey = keys? keys[i] : i
					if(predicate(obj[currentKey]))
						return true
				}
			}


			_obH.contains = _obH.includes = _obH.include = function(obj,target,formIndex) {
				// 如果包含指定值就返回true
				if(_obH.isObject(obj)) {
					obj = _obH.values(obj)
				}
				return obH.indexOf(obj,target,typeof formIndex == "number" && formIndex)

			}

			_obH.indexOf =function(obj,target,IndexKind) {
				// 重写indexOf函数
				for(var i = IndexKind || 0;i < obj.length;i++){
					if(obj[i] === target)
						return true
				}
				return false

			}
			_obH.values = function(obj) {
				// 只处理对象的一个函数，去掉函数的key
			    var keys = _.keys(obj);
			    var length = keys.length;
			    var values = Array(length);
			    for (var i = 0; i < length; i++) {
			      values[i] = obj[keys[i]];
			    }
			    return values;
			};

			_obH.pluck = function(obj, propertyName) {
				// 属于简化版map，用来萃取
				return _obH.map
			}





		})()