(() => {
    var __webpack_modules__ = {
        "./node_modules/lodash/_DataView.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_DataView.js ***!
  \******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"), root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var DataView = getNative(root, "DataView");
            module.exports = DataView;
        },
        "./node_modules/lodash/_Hash.js": 
        /*!**************************************!*\
  !*** ./node_modules/lodash/_Hash.js ***!
  \**************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var hashClear = __webpack_require__(/*! ./_hashClear */ "./node_modules/lodash/_hashClear.js"), hashDelete = __webpack_require__(/*! ./_hashDelete */ "./node_modules/lodash/_hashDelete.js"), hashGet = __webpack_require__(/*! ./_hashGet */ "./node_modules/lodash/_hashGet.js"), hashHas = __webpack_require__(/*! ./_hashHas */ "./node_modules/lodash/_hashHas.js"), hashSet = __webpack_require__(/*! ./_hashSet */ "./node_modules/lodash/_hashSet.js");
            function Hash(entries) {
                var index = -1, length = entries == null ? 0 : entries.length;
                this.clear();
                while (++index < length) {
                    var entry = entries[index];
                    this.set(entry[0], entry[1]);
                }
            }
            Hash.prototype.clear = hashClear;
            Hash.prototype["delete"] = hashDelete;
            Hash.prototype.get = hashGet;
            Hash.prototype.has = hashHas;
            Hash.prototype.set = hashSet;
            module.exports = Hash;
        },
        "./node_modules/lodash/_ListCache.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_ListCache.js ***!
  \*******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var listCacheClear = __webpack_require__(/*! ./_listCacheClear */ "./node_modules/lodash/_listCacheClear.js"), listCacheDelete = __webpack_require__(/*! ./_listCacheDelete */ "./node_modules/lodash/_listCacheDelete.js"), listCacheGet = __webpack_require__(/*! ./_listCacheGet */ "./node_modules/lodash/_listCacheGet.js"), listCacheHas = __webpack_require__(/*! ./_listCacheHas */ "./node_modules/lodash/_listCacheHas.js"), listCacheSet = __webpack_require__(/*! ./_listCacheSet */ "./node_modules/lodash/_listCacheSet.js");
            function ListCache(entries) {
                var index = -1, length = entries == null ? 0 : entries.length;
                this.clear();
                while (++index < length) {
                    var entry = entries[index];
                    this.set(entry[0], entry[1]);
                }
            }
            ListCache.prototype.clear = listCacheClear;
            ListCache.prototype["delete"] = listCacheDelete;
            ListCache.prototype.get = listCacheGet;
            ListCache.prototype.has = listCacheHas;
            ListCache.prototype.set = listCacheSet;
            module.exports = ListCache;
        },
        "./node_modules/lodash/_Map.js": 
        /*!*************************************!*\
  !*** ./node_modules/lodash/_Map.js ***!
  \*************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"), root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var Map = getNative(root, "Map");
            module.exports = Map;
        },
        "./node_modules/lodash/_MapCache.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_MapCache.js ***!
  \******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var mapCacheClear = __webpack_require__(/*! ./_mapCacheClear */ "./node_modules/lodash/_mapCacheClear.js"), mapCacheDelete = __webpack_require__(/*! ./_mapCacheDelete */ "./node_modules/lodash/_mapCacheDelete.js"), mapCacheGet = __webpack_require__(/*! ./_mapCacheGet */ "./node_modules/lodash/_mapCacheGet.js"), mapCacheHas = __webpack_require__(/*! ./_mapCacheHas */ "./node_modules/lodash/_mapCacheHas.js"), mapCacheSet = __webpack_require__(/*! ./_mapCacheSet */ "./node_modules/lodash/_mapCacheSet.js");
            function MapCache(entries) {
                var index = -1, length = entries == null ? 0 : entries.length;
                this.clear();
                while (++index < length) {
                    var entry = entries[index];
                    this.set(entry[0], entry[1]);
                }
            }
            MapCache.prototype.clear = mapCacheClear;
            MapCache.prototype["delete"] = mapCacheDelete;
            MapCache.prototype.get = mapCacheGet;
            MapCache.prototype.has = mapCacheHas;
            MapCache.prototype.set = mapCacheSet;
            module.exports = MapCache;
        },
        "./node_modules/lodash/_Promise.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_Promise.js ***!
  \*****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"), root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var Promise = getNative(root, "Promise");
            module.exports = Promise;
        },
        "./node_modules/lodash/_Set.js": 
        /*!*************************************!*\
  !*** ./node_modules/lodash/_Set.js ***!
  \*************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"), root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var Set = getNative(root, "Set");
            module.exports = Set;
        },
        "./node_modules/lodash/_SetCache.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_SetCache.js ***!
  \******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js"), setCacheAdd = __webpack_require__(/*! ./_setCacheAdd */ "./node_modules/lodash/_setCacheAdd.js"), setCacheHas = __webpack_require__(/*! ./_setCacheHas */ "./node_modules/lodash/_setCacheHas.js");
            function SetCache(values) {
                var index = -1, length = values == null ? 0 : values.length;
                this.__data__ = new MapCache;
                while (++index < length) {
                    this.add(values[index]);
                }
            }
            SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
            SetCache.prototype.has = setCacheHas;
            module.exports = SetCache;
        },
        "./node_modules/lodash/_Stack.js": 
        /*!***************************************!*\
  !*** ./node_modules/lodash/_Stack.js ***!
  \***************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"), stackClear = __webpack_require__(/*! ./_stackClear */ "./node_modules/lodash/_stackClear.js"), stackDelete = __webpack_require__(/*! ./_stackDelete */ "./node_modules/lodash/_stackDelete.js"), stackGet = __webpack_require__(/*! ./_stackGet */ "./node_modules/lodash/_stackGet.js"), stackHas = __webpack_require__(/*! ./_stackHas */ "./node_modules/lodash/_stackHas.js"), stackSet = __webpack_require__(/*! ./_stackSet */ "./node_modules/lodash/_stackSet.js");
            function Stack(entries) {
                var data = this.__data__ = new ListCache(entries);
                this.size = data.size;
            }
            Stack.prototype.clear = stackClear;
            Stack.prototype["delete"] = stackDelete;
            Stack.prototype.get = stackGet;
            Stack.prototype.has = stackHas;
            Stack.prototype.set = stackSet;
            module.exports = Stack;
        },
        "./node_modules/lodash/_Symbol.js": 
        /*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var Symbol = root.Symbol;
            module.exports = Symbol;
        },
        "./node_modules/lodash/_Uint8Array.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_Uint8Array.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var Uint8Array = root.Uint8Array;
            module.exports = Uint8Array;
        },
        "./node_modules/lodash/_WeakMap.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_WeakMap.js ***!
  \*****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"), root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var WeakMap = getNative(root, "WeakMap");
            module.exports = WeakMap;
        },
        "./node_modules/lodash/_arrayFilter.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_arrayFilter.js ***!
  \*********************************************/ module => {
            function arrayFilter(array, predicate) {
                var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
                while (++index < length) {
                    var value = array[index];
                    if (predicate(value, index, array)) {
                        result[resIndex++] = value;
                    }
                }
                return result;
            }
            module.exports = arrayFilter;
        },
        "./node_modules/lodash/_arrayLikeKeys.js": 
        /*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayLikeKeys.js ***!
  \***********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseTimes = __webpack_require__(/*! ./_baseTimes */ "./node_modules/lodash/_baseTimes.js"), isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"), isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"), isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"), isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"), isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            function arrayLikeKeys(value, inherited) {
                var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
                for (var key in value) {
                    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
                        result.push(key);
                    }
                }
                return result;
            }
            module.exports = arrayLikeKeys;
        },
        "./node_modules/lodash/_arrayPush.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayPush.js ***!
  \*******************************************/ module => {
            function arrayPush(array, values) {
                var index = -1, length = values.length, offset = array.length;
                while (++index < length) {
                    array[offset + index] = values[index];
                }
                return array;
            }
            module.exports = arrayPush;
        },
        "./node_modules/lodash/_arraySome.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_arraySome.js ***!
  \*******************************************/ module => {
            function arraySome(array, predicate) {
                var index = -1, length = array == null ? 0 : array.length;
                while (++index < length) {
                    if (predicate(array[index], index, array)) {
                        return true;
                    }
                }
                return false;
            }
            module.exports = arraySome;
        },
        "./node_modules/lodash/_assocIndexOf.js": 
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_assocIndexOf.js ***!
  \**********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");
            function assocIndexOf(array, key) {
                var length = array.length;
                while (length--) {
                    if (eq(array[length][0], key)) {
                        return length;
                    }
                }
                return -1;
            }
            module.exports = assocIndexOf;
        },
        "./node_modules/lodash/_baseGetAllKeys.js": 
        /*!************************************************!*\
  !*** ./node_modules/lodash/_baseGetAllKeys.js ***!
  \************************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"), isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");
            function baseGetAllKeys(object, keysFunc, symbolsFunc) {
                var result = keysFunc(object);
                return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
            }
            module.exports = baseGetAllKeys;
        },
        "./node_modules/lodash/_baseGetTag.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"), getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"), objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");
            var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
            var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
            function baseGetTag(value) {
                if (value == null) {
                    return value === undefined ? undefinedTag : nullTag;
                }
                return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
            }
            module.exports = baseGetTag;
        },
        "./node_modules/lodash/_baseIsArguments.js": 
        /*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsArguments.js ***!
  \*************************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"), isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
            var argsTag = "[object Arguments]";
            function baseIsArguments(value) {
                return isObjectLike(value) && baseGetTag(value) == argsTag;
            }
            module.exports = baseIsArguments;
        },
        "./node_modules/lodash/_baseIsEqual.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIsEqual.js ***!
  \*********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseIsEqualDeep = __webpack_require__(/*! ./_baseIsEqualDeep */ "./node_modules/lodash/_baseIsEqualDeep.js"), isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
            function baseIsEqual(value, other, bitmask, customizer, stack) {
                if (value === other) {
                    return true;
                }
                if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
                    return value !== value && other !== other;
                }
                return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
            }
            module.exports = baseIsEqual;
        },
        "./node_modules/lodash/_baseIsEqualDeep.js": 
        /*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsEqualDeep.js ***!
  \*************************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"), equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"), equalByTag = __webpack_require__(/*! ./_equalByTag */ "./node_modules/lodash/_equalByTag.js"), equalObjects = __webpack_require__(/*! ./_equalObjects */ "./node_modules/lodash/_equalObjects.js"), getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"), isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"), isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"), isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");
            var COMPARE_PARTIAL_FLAG = 1;
            var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
                var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
                objTag = objTag == argsTag ? objectTag : objTag;
                othTag = othTag == argsTag ? objectTag : othTag;
                var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
                if (isSameTag && isBuffer(object)) {
                    if (!isBuffer(other)) {
                        return false;
                    }
                    objIsArr = true;
                    objIsObj = false;
                }
                if (isSameTag && !objIsObj) {
                    stack || (stack = new Stack);
                    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
                }
                if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
                    var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
                    if (objIsWrapped || othIsWrapped) {
                        var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
                        stack || (stack = new Stack);
                        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
                    }
                }
                if (!isSameTag) {
                    return false;
                }
                stack || (stack = new Stack);
                return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
            }
            module.exports = baseIsEqualDeep;
        },
        "./node_modules/lodash/_baseIsNative.js": 
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIsNative.js ***!
  \**********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"), isMasked = __webpack_require__(/*! ./_isMasked */ "./node_modules/lodash/_isMasked.js"), isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"), toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");
            var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
            var reIsHostCtor = /^\[object .+?Constructor\]$/;
            var funcProto = Function.prototype, objectProto = Object.prototype;
            var funcToString = funcProto.toString;
            var hasOwnProperty = objectProto.hasOwnProperty;
            var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
            function baseIsNative(value) {
                if (!isObject(value) || isMasked(value)) {
                    return false;
                }
                var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
                return pattern.test(toSource(value));
            }
            module.exports = baseIsNative;
        },
        "./node_modules/lodash/_baseIsTypedArray.js": 
        /*!**************************************************!*\
  !*** ./node_modules/lodash/_baseIsTypedArray.js ***!
  \**************************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"), isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"), isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
            var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
            var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
            var typedArrayTags = {};
            typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
            typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
            function baseIsTypedArray(value) {
                return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
            }
            module.exports = baseIsTypedArray;
        },
        "./node_modules/lodash/_baseKeys.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_baseKeys.js ***!
  \******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"), nativeKeys = __webpack_require__(/*! ./_nativeKeys */ "./node_modules/lodash/_nativeKeys.js");
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            function baseKeys(object) {
                if (!isPrototype(object)) {
                    return nativeKeys(object);
                }
                var result = [];
                for (var key in Object(object)) {
                    if (hasOwnProperty.call(object, key) && key != "constructor") {
                        result.push(key);
                    }
                }
                return result;
            }
            module.exports = baseKeys;
        },
        "./node_modules/lodash/_baseTimes.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_baseTimes.js ***!
  \*******************************************/ module => {
            function baseTimes(n, iteratee) {
                var index = -1, result = Array(n);
                while (++index < n) {
                    result[index] = iteratee(index);
                }
                return result;
            }
            module.exports = baseTimes;
        },
        "./node_modules/lodash/_baseUnary.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnary.js ***!
  \*******************************************/ module => {
            function baseUnary(func) {
                return function(value) {
                    return func(value);
                };
            }
            module.exports = baseUnary;
        },
        "./node_modules/lodash/_cacheHas.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_cacheHas.js ***!
  \******************************************/ module => {
            function cacheHas(cache, key) {
                return cache.has(key);
            }
            module.exports = cacheHas;
        },
        "./node_modules/lodash/_coreJsData.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_coreJsData.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
            var coreJsData = root["__core-js_shared__"];
            module.exports = coreJsData;
        },
        "./node_modules/lodash/_equalArrays.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_equalArrays.js ***!
  \*********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var SetCache = __webpack_require__(/*! ./_SetCache */ "./node_modules/lodash/_SetCache.js"), arraySome = __webpack_require__(/*! ./_arraySome */ "./node_modules/lodash/_arraySome.js"), cacheHas = __webpack_require__(/*! ./_cacheHas */ "./node_modules/lodash/_cacheHas.js");
            var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
            function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
                var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
                if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
                    return false;
                }
                var arrStacked = stack.get(array);
                var othStacked = stack.get(other);
                if (arrStacked && othStacked) {
                    return arrStacked == other && othStacked == array;
                }
                var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache : undefined;
                stack.set(array, other);
                stack.set(other, array);
                while (++index < arrLength) {
                    var arrValue = array[index], othValue = other[index];
                    if (customizer) {
                        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
                    }
                    if (compared !== undefined) {
                        if (compared) {
                            continue;
                        }
                        result = false;
                        break;
                    }
                    if (seen) {
                        if (!arraySome(other, function(othValue, othIndex) {
                            if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                                return seen.push(othIndex);
                            }
                        })) {
                            result = false;
                            break;
                        }
                    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                        result = false;
                        break;
                    }
                }
                stack["delete"](array);
                stack["delete"](other);
                return result;
            }
            module.exports = equalArrays;
        },
        "./node_modules/lodash/_equalByTag.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_equalByTag.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"), Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js"), eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"), equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"), mapToArray = __webpack_require__(/*! ./_mapToArray */ "./node_modules/lodash/_mapToArray.js"), setToArray = __webpack_require__(/*! ./_setToArray */ "./node_modules/lodash/_setToArray.js");
            var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
            var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
            var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
            var symbolProto = Symbol ? Symbol.prototype : undefined, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
            function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
                switch (tag) {
                  case dataViewTag:
                    if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
                        return false;
                    }
                    object = object.buffer;
                    other = other.buffer;

                  case arrayBufferTag:
                    if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
                        return false;
                    }
                    return true;

                  case boolTag:
                  case dateTag:
                  case numberTag:
                    return eq(+object, +other);

                  case errorTag:
                    return object.name == other.name && object.message == other.message;

                  case regexpTag:
                  case stringTag:
                    return object == other + "";

                  case mapTag:
                    var convert = mapToArray;

                  case setTag:
                    var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
                    convert || (convert = setToArray);
                    if (object.size != other.size && !isPartial) {
                        return false;
                    }
                    var stacked = stack.get(object);
                    if (stacked) {
                        return stacked == other;
                    }
                    bitmask |= COMPARE_UNORDERED_FLAG;
                    stack.set(object, other);
                    var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
                    stack["delete"](object);
                    return result;

                  case symbolTag:
                    if (symbolValueOf) {
                        return symbolValueOf.call(object) == symbolValueOf.call(other);
                    }
                }
                return false;
            }
            module.exports = equalByTag;
        },
        "./node_modules/lodash/_equalObjects.js": 
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_equalObjects.js ***!
  \**********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js");
            var COMPARE_PARTIAL_FLAG = 1;
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
                var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
                if (objLength != othLength && !isPartial) {
                    return false;
                }
                var index = objLength;
                while (index--) {
                    var key = objProps[index];
                    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
                        return false;
                    }
                }
                var objStacked = stack.get(object);
                var othStacked = stack.get(other);
                if (objStacked && othStacked) {
                    return objStacked == other && othStacked == object;
                }
                var result = true;
                stack.set(object, other);
                stack.set(other, object);
                var skipCtor = isPartial;
                while (++index < objLength) {
                    key = objProps[index];
                    var objValue = object[key], othValue = other[key];
                    if (customizer) {
                        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
                    }
                    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
                        result = false;
                        break;
                    }
                    skipCtor || (skipCtor = key == "constructor");
                }
                if (result && !skipCtor) {
                    var objCtor = object.constructor, othCtor = other.constructor;
                    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
                        result = false;
                    }
                }
                stack["delete"](object);
                stack["delete"](other);
                return result;
            }
            module.exports = equalObjects;
        },
        "./node_modules/lodash/_freeGlobal.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var freeGlobal = typeof __webpack_require__.g == "object" && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;
            module.exports = freeGlobal;
        },
        "./node_modules/lodash/_getAllKeys.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_getAllKeys.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"), getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"), keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
            function getAllKeys(object) {
                return baseGetAllKeys(object, keys, getSymbols);
            }
            module.exports = getAllKeys;
        },
        "./node_modules/lodash/_getMapData.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_getMapData.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var isKeyable = __webpack_require__(/*! ./_isKeyable */ "./node_modules/lodash/_isKeyable.js");
            function getMapData(map, key) {
                var data = map.__data__;
                return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
            }
            module.exports = getMapData;
        },
        "./node_modules/lodash/_getNative.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_getNative.js ***!
  \*******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseIsNative = __webpack_require__(/*! ./_baseIsNative */ "./node_modules/lodash/_baseIsNative.js"), getValue = __webpack_require__(/*! ./_getValue */ "./node_modules/lodash/_getValue.js");
            function getNative(object, key) {
                var value = getValue(object, key);
                return baseIsNative(value) ? value : undefined;
            }
            module.exports = getNative;
        },
        "./node_modules/lodash/_getRawTag.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            var nativeObjectToString = objectProto.toString;
            var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
            function getRawTag(value) {
                var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
                try {
                    value[symToStringTag] = undefined;
                    var unmasked = true;
                } catch (e) {}
                var result = nativeObjectToString.call(value);
                if (unmasked) {
                    if (isOwn) {
                        value[symToStringTag] = tag;
                    } else {
                        delete value[symToStringTag];
                    }
                }
                return result;
            }
            module.exports = getRawTag;
        },
        "./node_modules/lodash/_getSymbols.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_getSymbols.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var arrayFilter = __webpack_require__(/*! ./_arrayFilter */ "./node_modules/lodash/_arrayFilter.js"), stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");
            var objectProto = Object.prototype;
            var propertyIsEnumerable = objectProto.propertyIsEnumerable;
            var nativeGetSymbols = Object.getOwnPropertySymbols;
            var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
                if (object == null) {
                    return [];
                }
                object = Object(object);
                return arrayFilter(nativeGetSymbols(object), function(symbol) {
                    return propertyIsEnumerable.call(object, symbol);
                });
            };
            module.exports = getSymbols;
        },
        "./node_modules/lodash/_getTag.js": 
        /*!****************************************!*\
  !*** ./node_modules/lodash/_getTag.js ***!
  \****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var DataView = __webpack_require__(/*! ./_DataView */ "./node_modules/lodash/_DataView.js"), Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"), Promise = __webpack_require__(/*! ./_Promise */ "./node_modules/lodash/_Promise.js"), Set = __webpack_require__(/*! ./_Set */ "./node_modules/lodash/_Set.js"), WeakMap = __webpack_require__(/*! ./_WeakMap */ "./node_modules/lodash/_WeakMap.js"), baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"), toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");
            var mapTag = "[object Map]", objectTag = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
            var dataViewTag = "[object DataView]";
            var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
            var getTag = baseGetTag;
            if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set) != setTag || WeakMap && getTag(new WeakMap) != weakMapTag) {
                getTag = function(value) {
                    var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : "";
                    if (ctorString) {
                        switch (ctorString) {
                          case dataViewCtorString:
                            return dataViewTag;

                          case mapCtorString:
                            return mapTag;

                          case promiseCtorString:
                            return promiseTag;

                          case setCtorString:
                            return setTag;

                          case weakMapCtorString:
                            return weakMapTag;
                        }
                    }
                    return result;
                };
            }
            module.exports = getTag;
        },
        "./node_modules/lodash/_getValue.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_getValue.js ***!
  \******************************************/ module => {
            function getValue(object, key) {
                return object == null ? undefined : object[key];
            }
            module.exports = getValue;
        },
        "./node_modules/lodash/_hashClear.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_hashClear.js ***!
  \*******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
            function hashClear() {
                this.__data__ = nativeCreate ? nativeCreate(null) : {};
                this.size = 0;
            }
            module.exports = hashClear;
        },
        "./node_modules/lodash/_hashDelete.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_hashDelete.js ***!
  \********************************************/ module => {
            function hashDelete(key) {
                var result = this.has(key) && delete this.__data__[key];
                this.size -= result ? 1 : 0;
                return result;
            }
            module.exports = hashDelete;
        },
        "./node_modules/lodash/_hashGet.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_hashGet.js ***!
  \*****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
            var HASH_UNDEFINED = "__lodash_hash_undefined__";
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            function hashGet(key) {
                var data = this.__data__;
                if (nativeCreate) {
                    var result = data[key];
                    return result === HASH_UNDEFINED ? undefined : result;
                }
                return hasOwnProperty.call(data, key) ? data[key] : undefined;
            }
            module.exports = hashGet;
        },
        "./node_modules/lodash/_hashHas.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_hashHas.js ***!
  \*****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            function hashHas(key) {
                var data = this.__data__;
                return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
            }
            module.exports = hashHas;
        },
        "./node_modules/lodash/_hashSet.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_hashSet.js ***!
  \*****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
            var HASH_UNDEFINED = "__lodash_hash_undefined__";
            function hashSet(key, value) {
                var data = this.__data__;
                this.size += this.has(key) ? 0 : 1;
                data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
                return this;
            }
            module.exports = hashSet;
        },
        "./node_modules/lodash/_isIndex.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_isIndex.js ***!
  \*****************************************/ module => {
            var MAX_SAFE_INTEGER = 9007199254740991;
            var reIsUint = /^(?:0|[1-9]\d*)$/;
            function isIndex(value, length) {
                var type = typeof value;
                length = length == null ? MAX_SAFE_INTEGER : length;
                return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
            }
            module.exports = isIndex;
        },
        "./node_modules/lodash/_isKeyable.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_isKeyable.js ***!
  \*******************************************/ module => {
            function isKeyable(value) {
                var type = typeof value;
                return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
            }
            module.exports = isKeyable;
        },
        "./node_modules/lodash/_isMasked.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_isMasked.js ***!
  \******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var coreJsData = __webpack_require__(/*! ./_coreJsData */ "./node_modules/lodash/_coreJsData.js");
            var maskSrcKey = function() {
                var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
                return uid ? "Symbol(src)_1." + uid : "";
            }();
            function isMasked(func) {
                return !!maskSrcKey && maskSrcKey in func;
            }
            module.exports = isMasked;
        },
        "./node_modules/lodash/_isPrototype.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_isPrototype.js ***!
  \*********************************************/ module => {
            var objectProto = Object.prototype;
            function isPrototype(value) {
                var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
                return value === proto;
            }
            module.exports = isPrototype;
        },
        "./node_modules/lodash/_listCacheClear.js": 
        /*!************************************************!*\
  !*** ./node_modules/lodash/_listCacheClear.js ***!
  \************************************************/ module => {
            function listCacheClear() {
                this.__data__ = [];
                this.size = 0;
            }
            module.exports = listCacheClear;
        },
        "./node_modules/lodash/_listCacheDelete.js": 
        /*!*************************************************!*\
  !*** ./node_modules/lodash/_listCacheDelete.js ***!
  \*************************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
            var arrayProto = Array.prototype;
            var splice = arrayProto.splice;
            function listCacheDelete(key) {
                var data = this.__data__, index = assocIndexOf(data, key);
                if (index < 0) {
                    return false;
                }
                var lastIndex = data.length - 1;
                if (index == lastIndex) {
                    data.pop();
                } else {
                    splice.call(data, index, 1);
                }
                --this.size;
                return true;
            }
            module.exports = listCacheDelete;
        },
        "./node_modules/lodash/_listCacheGet.js": 
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheGet.js ***!
  \**********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
            function listCacheGet(key) {
                var data = this.__data__, index = assocIndexOf(data, key);
                return index < 0 ? undefined : data[index][1];
            }
            module.exports = listCacheGet;
        },
        "./node_modules/lodash/_listCacheHas.js": 
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheHas.js ***!
  \**********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
            function listCacheHas(key) {
                return assocIndexOf(this.__data__, key) > -1;
            }
            module.exports = listCacheHas;
        },
        "./node_modules/lodash/_listCacheSet.js": 
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheSet.js ***!
  \**********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
            function listCacheSet(key, value) {
                var data = this.__data__, index = assocIndexOf(data, key);
                if (index < 0) {
                    ++this.size;
                    data.push([ key, value ]);
                } else {
                    data[index][1] = value;
                }
                return this;
            }
            module.exports = listCacheSet;
        },
        "./node_modules/lodash/_mapCacheClear.js": 
        /*!***********************************************!*\
  !*** ./node_modules/lodash/_mapCacheClear.js ***!
  \***********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var Hash = __webpack_require__(/*! ./_Hash */ "./node_modules/lodash/_Hash.js"), ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"), Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js");
            function mapCacheClear() {
                this.size = 0;
                this.__data__ = {
                    hash: new Hash,
                    map: new (Map || ListCache),
                    string: new Hash
                };
            }
            module.exports = mapCacheClear;
        },
        "./node_modules/lodash/_mapCacheDelete.js": 
        /*!************************************************!*\
  !*** ./node_modules/lodash/_mapCacheDelete.js ***!
  \************************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
            function mapCacheDelete(key) {
                var result = getMapData(this, key)["delete"](key);
                this.size -= result ? 1 : 0;
                return result;
            }
            module.exports = mapCacheDelete;
        },
        "./node_modules/lodash/_mapCacheGet.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheGet.js ***!
  \*********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
            function mapCacheGet(key) {
                return getMapData(this, key).get(key);
            }
            module.exports = mapCacheGet;
        },
        "./node_modules/lodash/_mapCacheHas.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheHas.js ***!
  \*********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
            function mapCacheHas(key) {
                return getMapData(this, key).has(key);
            }
            module.exports = mapCacheHas;
        },
        "./node_modules/lodash/_mapCacheSet.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheSet.js ***!
  \*********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
            function mapCacheSet(key, value) {
                var data = getMapData(this, key), size = data.size;
                data.set(key, value);
                this.size += data.size == size ? 0 : 1;
                return this;
            }
            module.exports = mapCacheSet;
        },
        "./node_modules/lodash/_mapToArray.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_mapToArray.js ***!
  \********************************************/ module => {
            function mapToArray(map) {
                var index = -1, result = Array(map.size);
                map.forEach(function(value, key) {
                    result[++index] = [ key, value ];
                });
                return result;
            }
            module.exports = mapToArray;
        },
        "./node_modules/lodash/_nativeCreate.js": 
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeCreate.js ***!
  \**********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");
            var nativeCreate = getNative(Object, "create");
            module.exports = nativeCreate;
        },
        "./node_modules/lodash/_nativeKeys.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_nativeKeys.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");
            var nativeKeys = overArg(Object.keys, Object);
            module.exports = nativeKeys;
        },
        "./node_modules/lodash/_nodeUtil.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_nodeUtil.js ***!
  \******************************************/ (module, exports, __webpack_require__) => {
            module = __webpack_require__.nmd(module);
            var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");
            var freeExports = true && exports && !exports.nodeType && exports;
            var freeModule = freeExports && "object" == "object" && module && !module.nodeType && module;
            var moduleExports = freeModule && freeModule.exports === freeExports;
            var freeProcess = moduleExports && freeGlobal.process;
            var nodeUtil = function() {
                try {
                    var types = freeModule && freeModule.require && freeModule.require("util").types;
                    if (types) {
                        return types;
                    }
                    return freeProcess && freeProcess.binding && freeProcess.binding("util");
                } catch (e) {}
            }();
            module.exports = nodeUtil;
        },
        "./node_modules/lodash/_objectToString.js": 
        /*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/ module => {
            var objectProto = Object.prototype;
            var nativeObjectToString = objectProto.toString;
            function objectToString(value) {
                return nativeObjectToString.call(value);
            }
            module.exports = objectToString;
        },
        "./node_modules/lodash/_overArg.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_overArg.js ***!
  \*****************************************/ module => {
            function overArg(func, transform) {
                return function(arg) {
                    return func(transform(arg));
                };
            }
            module.exports = overArg;
        },
        "./node_modules/lodash/_root.js": 
        /*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");
            var freeSelf = typeof self == "object" && self && self.Object === Object && self;
            var root = freeGlobal || freeSelf || Function("return this")();
            module.exports = root;
        },
        "./node_modules/lodash/_setCacheAdd.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheAdd.js ***!
  \*********************************************/ module => {
            var HASH_UNDEFINED = "__lodash_hash_undefined__";
            function setCacheAdd(value) {
                this.__data__.set(value, HASH_UNDEFINED);
                return this;
            }
            module.exports = setCacheAdd;
        },
        "./node_modules/lodash/_setCacheHas.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheHas.js ***!
  \*********************************************/ module => {
            function setCacheHas(value) {
                return this.__data__.has(value);
            }
            module.exports = setCacheHas;
        },
        "./node_modules/lodash/_setToArray.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_setToArray.js ***!
  \********************************************/ module => {
            function setToArray(set) {
                var index = -1, result = Array(set.size);
                set.forEach(function(value) {
                    result[++index] = value;
                });
                return result;
            }
            module.exports = setToArray;
        },
        "./node_modules/lodash/_stackClear.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/_stackClear.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js");
            function stackClear() {
                this.__data__ = new ListCache;
                this.size = 0;
            }
            module.exports = stackClear;
        },
        "./node_modules/lodash/_stackDelete.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/_stackDelete.js ***!
  \*********************************************/ module => {
            function stackDelete(key) {
                var data = this.__data__, result = data["delete"](key);
                this.size = data.size;
                return result;
            }
            module.exports = stackDelete;
        },
        "./node_modules/lodash/_stackGet.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_stackGet.js ***!
  \******************************************/ module => {
            function stackGet(key) {
                return this.__data__.get(key);
            }
            module.exports = stackGet;
        },
        "./node_modules/lodash/_stackHas.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_stackHas.js ***!
  \******************************************/ module => {
            function stackHas(key) {
                return this.__data__.has(key);
            }
            module.exports = stackHas;
        },
        "./node_modules/lodash/_stackSet.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_stackSet.js ***!
  \******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"), Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"), MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");
            var LARGE_ARRAY_SIZE = 200;
            function stackSet(key, value) {
                var data = this.__data__;
                if (data instanceof ListCache) {
                    var pairs = data.__data__;
                    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
                        pairs.push([ key, value ]);
                        this.size = ++data.size;
                        return this;
                    }
                    data = this.__data__ = new MapCache(pairs);
                }
                data.set(key, value);
                this.size = data.size;
                return this;
            }
            module.exports = stackSet;
        },
        "./node_modules/lodash/_toSource.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/_toSource.js ***!
  \******************************************/ module => {
            var funcProto = Function.prototype;
            var funcToString = funcProto.toString;
            function toSource(func) {
                if (func != null) {
                    try {
                        return funcToString.call(func);
                    } catch (e) {}
                    try {
                        return func + "";
                    } catch (e) {}
                }
                return "";
            }
            module.exports = toSource;
        },
        "./node_modules/lodash/eq.js": 
        /*!***********************************!*\
  !*** ./node_modules/lodash/eq.js ***!
  \***********************************/ module => {
            function eq(value, other) {
                return value === other || value !== value && other !== other;
            }
            module.exports = eq;
        },
        "./node_modules/lodash/isArguments.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/isArguments.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseIsArguments = __webpack_require__(/*! ./_baseIsArguments */ "./node_modules/lodash/_baseIsArguments.js"), isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
            var objectProto = Object.prototype;
            var hasOwnProperty = objectProto.hasOwnProperty;
            var propertyIsEnumerable = objectProto.propertyIsEnumerable;
            var isArguments = baseIsArguments(function() {
                return arguments;
            }()) ? baseIsArguments : function(value) {
                return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
            };
            module.exports = isArguments;
        },
        "./node_modules/lodash/isArray.js": 
        /*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/ module => {
            var isArray = Array.isArray;
            module.exports = isArray;
        },
        "./node_modules/lodash/isArrayLike.js": 
        /*!********************************************!*\
  !*** ./node_modules/lodash/isArrayLike.js ***!
  \********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"), isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js");
            function isArrayLike(value) {
                return value != null && isLength(value.length) && !isFunction(value);
            }
            module.exports = isArrayLike;
        },
        "./node_modules/lodash/isBuffer.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/isBuffer.js ***!
  \*****************************************/ (module, exports, __webpack_require__) => {
            module = __webpack_require__.nmd(module);
            var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js"), stubFalse = __webpack_require__(/*! ./stubFalse */ "./node_modules/lodash/stubFalse.js");
            var freeExports = true && exports && !exports.nodeType && exports;
            var freeModule = freeExports && "object" == "object" && module && !module.nodeType && module;
            var moduleExports = freeModule && freeModule.exports === freeExports;
            var Buffer = moduleExports ? root.Buffer : undefined;
            var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
            var isBuffer = nativeIsBuffer || stubFalse;
            module.exports = isBuffer;
        },
        "./node_modules/lodash/isEqual.js": 
        /*!****************************************!*\
  !*** ./node_modules/lodash/isEqual.js ***!
  \****************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ "./node_modules/lodash/_baseIsEqual.js");
            function isEqual(value, other) {
                return baseIsEqual(value, other);
            }
            module.exports = isEqual;
        },
        "./node_modules/lodash/isFunction.js": 
        /*!*******************************************!*\
  !*** ./node_modules/lodash/isFunction.js ***!
  \*******************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"), isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");
            var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
            function isFunction(value) {
                if (!isObject(value)) {
                    return false;
                }
                var tag = baseGetTag(value);
                return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
            }
            module.exports = isFunction;
        },
        "./node_modules/lodash/isLength.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/isLength.js ***!
  \*****************************************/ module => {
            var MAX_SAFE_INTEGER = 9007199254740991;
            function isLength(value) {
                return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
            }
            module.exports = isLength;
        },
        "./node_modules/lodash/isObject.js": 
        /*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/ module => {
            function isObject(value) {
                var type = typeof value;
                return value != null && (type == "object" || type == "function");
            }
            module.exports = isObject;
        },
        "./node_modules/lodash/isObjectLike.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/ module => {
            function isObjectLike(value) {
                return value != null && typeof value == "object";
            }
            module.exports = isObjectLike;
        },
        "./node_modules/lodash/isTypedArray.js": 
        /*!*********************************************!*\
  !*** ./node_modules/lodash/isTypedArray.js ***!
  \*********************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var baseIsTypedArray = __webpack_require__(/*! ./_baseIsTypedArray */ "./node_modules/lodash/_baseIsTypedArray.js"), baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"), nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");
            var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
            var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
            module.exports = isTypedArray;
        },
        "./node_modules/lodash/keys.js": 
        /*!*************************************!*\
  !*** ./node_modules/lodash/keys.js ***!
  \*************************************/ (module, __unused_webpack_exports, __webpack_require__) => {
            var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"), baseKeys = __webpack_require__(/*! ./_baseKeys */ "./node_modules/lodash/_baseKeys.js"), isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");
            function keys(object) {
                return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
            }
            module.exports = keys;
        },
        "./node_modules/lodash/stubArray.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/stubArray.js ***!
  \******************************************/ module => {
            function stubArray() {
                return [];
            }
            module.exports = stubArray;
        },
        "./node_modules/lodash/stubFalse.js": 
        /*!******************************************!*\
  !*** ./node_modules/lodash/stubFalse.js ***!
  \******************************************/ module => {
            function stubFalse() {
                return false;
            }
            module.exports = stubFalse;
        },
        "./src/sidebar/index.js": 
        /*!*******************************************!*\
  !*** ./src/sidebar/index.js + 11 modules ***!
  \*******************************************/ (__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {
            "use strict";
            const external_wp_plugins_namespaceObject = window["wp"]["plugins"];
            const external_wp_components_namespaceObject = window["wp"]["components"];
            const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
            var external_wp_apiFetch_default = __webpack_require__.n(external_wp_apiFetch_namespaceObject);
            const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
            const external_wp_element_namespaceObject = window["wp"]["element"];
            const external_wp_data_namespaceObject = window["wp"]["data"];
            const external_wp_domReady_namespaceObject = window["wp"]["domReady"];
            var external_wp_domReady_default = __webpack_require__.n(external_wp_domReady_namespaceObject);
            const external_wp_url_namespaceObject = window["wp"]["url"];
            var isEqual = __webpack_require__("./node_modules/lodash/isEqual.js");
            var isEqual_default = __webpack_require__.n(isEqual);
            const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
            const BlockTogglePanel = ({isLoading: isLoading = false, isLoadingMore: isLoadingMore = false, error: error = null, searchValue: searchValue = "", onSearchChange: onSearchChange = () => {}, blocksEnabled: blocksEnabled = {}, blockDefinitions: blockDefinitions = {}, onToggle: onToggle, hasMore: hasMore = false, onLoadMore: onLoadMore = () => {}, disabled: disabled = false}) => {
                var _searchValue$toLowerC;
                const orderedKeys = Object.keys(blockDefinitions).length ? Object.keys(blockDefinitions) : Object.keys(blocksEnabled);
                const entries = orderedKeys.map(key => {
                    var _blocksEnabled$key;
                    return [ key, (_blocksEnabled$key = blocksEnabled?.[key]) !== null && _blocksEnabled$key !== void 0 ? _blocksEnabled$key : true ];
                });
                const searchTerm = (_searchValue$toLowerC = searchValue?.toLowerCase?.()) !== null && _searchValue$toLowerC !== void 0 ? _searchValue$toLowerC : "";
                const filteredEntries = entries.filter(([blockName]) => {
                    if (!searchTerm) {
                        return true;
                    }
                    const label = blockDefinitions[blockName]?.title || blockName;
                    const description = blockDefinitions[blockName]?.description || "";
                    const haystack = `${label} ${description}`.toLowerCase();
                    return haystack.includes(searchTerm);
                });
                return (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Panel, {
                    children: (0, external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
                        title: (0, external_wp_i18n_namespaceObject.__)("Enable/Disable Blocks", "yokoi"),
                        initialOpen: true,
                        children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SearchControl, {
                            value: searchValue,
                            onChange: onSearchChange,
                            placeholder: (0, external_wp_i18n_namespaceObject.__)("Search blocks…", "yokoi"),
                            disabled: disabled
                        }), isLoading && (0, external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
                            children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}), (0, 
                            external_ReactJSXRuntime_namespaceObject.jsx)("span", {
                                children: (0, external_wp_i18n_namespaceObject.__)("Loading block catalog…", "yokoi")
                            }) ]
                        }), error && !isLoading && (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
                            status: "error",
                            children: error?.message || (0, external_wp_i18n_namespaceObject.__)("Unable to load block catalog.", "yokoi")
                        }), entries.length === 0 && (0, external_ReactJSXRuntime_namespaceObject.jsx)("p", {
                            children: (0, external_wp_i18n_namespaceObject.__)("No blocks registered yet. Blocks will appear here once available.", "yokoi")
                        }), !isLoading && filteredEntries.length === 0 && entries.length > 0 && (0, external_ReactJSXRuntime_namespaceObject.jsx)("p", {
                            children: (0, external_wp_i18n_namespaceObject.__)("No blocks match your search.", "yokoi")
                        }), filteredEntries.map(([blockName, enabled]) => {
                            const label = blockDefinitions[blockName]?.title || blockName;
                            const description = blockDefinitions[blockName]?.description;
                            return (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
                                label: label,
                                checked: Boolean(enabled),
                                onChange: () => onToggle(blockName),
                                help: description,
                                __nextHasNoMarginBottom: true,
                                disabled: disabled
                            }, blockName);
                        }), hasMore && !isLoading && (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
                            variant: "secondary",
                            onClick: onLoadMore,
                            isBusy: isLoadingMore,
                            disabled: isLoadingMore || disabled,
                            children: isLoadingMore ? (0, external_wp_i18n_namespaceObject.__)("Loading…", "yokoi") : (0, 
                            external_wp_i18n_namespaceObject.__)("Load more blocks", "yokoi")
                        }) ]
                    })
                });
            };
            const components_BlockTogglePanel = BlockTogglePanel;
            const DEBUG_STORAGE_KEY = "YOKOI_DEBUG";
            const ensureDebugFlag = () => {
                if (typeof window === "undefined") {
                    return false;
                }
                let storedValue = null;
                try {
                    storedValue = window.localStorage?.getItem(DEBUG_STORAGE_KEY);
                } catch (error) {}
                if (typeof window.YOKOI_DEBUG === "undefined") {
                    window.YOKOI_DEBUG = storedValue !== null ? storedValue === "true" : true;
                }
                if (window.YOKOI_DEBUG && storedValue !== "true") {
                    try {
                        window.localStorage?.setItem(DEBUG_STORAGE_KEY, "true");
                    } catch (error) {}
                }
                return Boolean(window.YOKOI_DEBUG);
            };
            const recordDebugLog = args => {
                if (typeof window === "undefined") {
                    return;
                }
                if (!Array.isArray(window.YOKOI_DEBUG_LOGS)) {
                    window.YOKOI_DEBUG_LOGS = [];
                }
                window.YOKOI_DEBUG_LOGS.push(args);
            };
            ensureDebugFlag();
            const logDebug = (...args) => {
                recordDebugLog(args);
                if (ensureDebugFlag()) {
                    try {
                        window.localStorage?.setItem(DEBUG_STORAGE_KEY, "true");
                    } catch (error) {}
                    console.log("[Yokoi]", ...args);
                }
            };
            const bootstrap = window.yokoiSettings || {};
            const initialBlockList = Array.isArray(bootstrap.blocks) ? bootstrap.blocks : [];
            const CATALOG_PAGE_SIZE = 100;
            const SIDEBAR_PLUGIN_SLUG = "yokoi-settings-sidebar";
            const shouldAutoOpenSidebar = () => {
                try {
                    const params = new URLSearchParams(window.location.search);
                    return params.get("yokoi_sidebar") === "1";
                } catch (error) {
                    return false;
                }
            };
            const openSidebar = () => {
                const data = window?.wp?.data;
                if (!data?.dispatch) {
                    return;
                }
                const editSiteDispatch = data.dispatch("core/edit-site");
                if (editSiteDispatch?.openGeneralSidebar) {
                    editSiteDispatch.openGeneralSidebar(`edit-site/plugin-sidebar/${SIDEBAR_PLUGIN_SLUG}`);
                    return;
                }
                const editPostDispatch = data.dispatch("core/edit-post");
                if (editPostDispatch?.openGeneralSidebar) {
                    editPostDispatch.openGeneralSidebar(`edit-post/plugin-sidebar/${SIDEBAR_PLUGIN_SLUG}`);
                }
            };
            const scheduleSidebarOpen = () => {
                if (!shouldAutoOpenSidebar()) {
                    return;
                }
                let attempts = 5;
                const tick = () => {
                    openSidebar();
                    attempts -= 1;
                    if (attempts > 0) {
                        window.setTimeout(tick, 300);
                    }
                };
                window.setTimeout(tick, 150);
            };
            const toDefinitionMap = (list = []) => list.reduce((acc, block) => {
                if (block?.name) {
                    acc[block.name] = block;
                }
                return acc;
            }, {});
            const buildDefaultSettings = (definitions = {}) => ({
                blocks_enabled: Object.fromEntries(Object.keys(definitions).map(name => [ name, true ])),
                default_configs: {},
                visibility_controls: {},
                date_now_api_key: ""
            });
            const sanitizeSettingsWithDefinitions = (value, definitions) => {
                const defaults = buildDefaultSettings(definitions);
                const output = {
                    ...defaults,
                    ...value || {}
                };
                output.blocks_enabled = {
                    ...defaults.blocks_enabled,
                    ...value?.blocks_enabled || {}
                };
                Object.keys(definitions).forEach(blockName => {
                    if (typeof output.blocks_enabled[blockName] !== "boolean") {
                        output.blocks_enabled[blockName] = Boolean(defaults.blocks_enabled[blockName]);
                    }
                });
                output.default_configs = {
                    ...defaults.default_configs,
                    ...value?.default_configs || {}
                };
                output.visibility_controls = {
                    ...defaults.visibility_controls,
                    ...value?.visibility_controls || {}
                };
                output.date_now_api_key = typeof value?.date_now_api_key === "string" ? value.date_now_api_key : defaults.date_now_api_key;
                return output;
            };
            const broadcastSettingsUpdate = nextSettings => {
                if (typeof window === "undefined") {
                    return;
                }
                window.yokoiSettings = {
                    ...window.yokoiSettings || {},
                    settings: nextSettings
                };
                window.dispatchEvent(new CustomEvent("yokoi:settings-updated", {
                    detail: nextSettings
                }));
            };
            if (bootstrap?.nonce) {
                external_wp_apiFetch_default().use(external_wp_apiFetch_default().createNonceMiddleware(bootstrap.nonce));
            }
            let SitePluginSidebar = null;
            let SitePluginSidebarMoreMenuItem = null;
            const YokoiSidebarIcon = (props = {}) => (0, external_ReactJSXRuntime_namespaceObject.jsxs)("svg", {
                className: "yokoi-sidebar__icon",
                width: "20",
                height: "20",
                viewBox: "0 0 163.3 163.3",
                xmlns: "http://www.w3.org/2000/svg",
                "aria-hidden": "true",
                focusable: "false",
                ...props,
                children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)("path", {
                    d: "M145.1,38.5c0-1.2-.9-2.1-2.1-2.1H20.3c-1.2,0-2.1.9-2.1,2.1v104.4c0,1.2.9,2.1,2.1,2.1h122.7c1.2,0,2.1-.9,2.1-2.1V38.5ZM0,161.9V1.5C.6.5,1.8,0,3.5,0,51.6,0,98.1,0,143.1,0c1.2,0,2.1.9,2.1,2.1v13.9c0,1.2.9,2.1,2.1,2.2.6,0,5.2,0,13.9,0,1.4,0,2.1.8,2.1,2.4,0,3.5,0,50,0,139.5,0,2.2-.6,3.1-2.8,3.1-53,0-105.9,0-158.9,0,0,0-.2,0-.2,0l-1.4-1.3",
                    fill: "currentColor"
                }), (0, external_ReactJSXRuntime_namespaceObject.jsx)("path", {
                    d: "M75.2,86.9c0,1.2-.9,2.1-2.1,2.1h-8.8c-1.2,0-2.1-1-2.1-2.1v-18.2c0-1.2,1-2.1,2.1-2.1h8.8c1.2,0,2.1,1,2.1,2.1v18.2Z",
                    fill: "currentColor"
                }), (0, external_ReactJSXRuntime_namespaceObject.jsx)("path", {
                    d: "M101.1,86.9c0,1.2-.9,2.1-2.1,2.1h-8.8c-1.2,0-2.1-.9-2.1-2.1v-18.2c0-1.2.9-2.1,2.1-2.1h8.8c1.2,0,2.1.9,2.1,2.1v18.2Z",
                    fill: "currentColor"
                }), (0, external_ReactJSXRuntime_namespaceObject.jsx)("path", {
                    d: "M81.6,101.8c19.6,0,29.5,0,29.7,0,1.1,0,1.9-.9,1.9-2v-8.1c0-1.1.9-2,2-2h9c1.1,0,2,.9,2,2v8.9c0,1.1-.9,2.1-2.1,2.1h-8.2c-1.1,0-1.9.8-1.9,1.9v8.1c0,1.1-.9,1.9-1.9,2,0,0-10.2,0-30.5,0-20.3,0-30.5,0-30.5,0-1.1,0-1.9-1-1.9-2v-8.1c0-1-.9-1.9-2-1.9h-8.2c-1.1,0-2.1-.9-2.1-2.1v-8.9c0-1.1.9-2,2-2h9c1.1,0,2,.9,2,2v8.1c0,1.1.9,1.9,1.9,2,.2,0,10,0,29.7,0Z",
                    fill: "currentColor"
                }) ]
            });
            const YokoiSidebar = () => {
                var _bootstrap$settings, _blocksEnabled$yokoi;
                if (!SitePluginSidebar || !SitePluginSidebarMoreMenuItem) {
                    return null;
                }
                const [blockDefinitions, setBlockDefinitions] = (0, external_wp_element_namespaceObject.useState)(() => toDefinitionMap(initialBlockList));
                const [isBlockCatalogLoading, setIsBlockCatalogLoading] = (0, external_wp_element_namespaceObject.useState)(false);
                const [blockCatalogError, setBlockCatalogError] = (0, external_wp_element_namespaceObject.useState)(null);
                const [searchTerm, setSearchTerm] = (0, external_wp_element_namespaceObject.useState)("");
                const [debouncedSearchTerm, setDebouncedSearchTerm] = (0, external_wp_element_namespaceObject.useState)("");
                const [catalogMeta, setCatalogMeta] = (0, external_wp_element_namespaceObject.useState)({
                    page: 0,
                    totalPages: 0,
                    search: ""
                });
                const [isCatalogLoadingMore, setIsCatalogLoadingMore] = (0, external_wp_element_namespaceObject.useState)(false);
                (0, external_wp_element_namespaceObject.useEffect)(() => {
                    const handle = setTimeout(() => {
                        setDebouncedSearchTerm(searchTerm);
                    }, 300);
                    return () => clearTimeout(handle);
                }, [ searchTerm ]);
                const optionName = bootstrap?.settingsOption || "yokoi_settings";
                const canManage = bootstrap?.capabilities?.canManage !== false;
                const blocksEndpoint = bootstrap?.blocksEndpoint;
                const {editEntityRecord: editEntityRecord, receiveEntityRecords: receiveEntityRecords} = (0, 
                external_wp_data_namespaceObject.useDispatch)("core");
                const {optionValue: optionValue, persistedOptionValue: persistedOptionValue, optionDirty: optionDirty, optionResolving: optionResolving, optionSaving: optionSaving, entityConfig: entityConfig} = (0, 
                external_wp_data_namespaceObject.useSelect)(select => {
                    const coreStore = select("core");
                    const record = coreStore.getEntityRecord("root", "option", optionName);
                    const editedRecord = coreStore.getEditedEntityRecord ? coreStore.getEditedEntityRecord("root", "option", optionName) : null;
                    const hasEditedValue = editedRecord && Object.prototype.hasOwnProperty.call(editedRecord, "value");
                    return {
                        optionValue: hasEditedValue ? editedRecord.value : record?.value,
                        persistedOptionValue: record?.value,
                        optionDirty: coreStore.hasEditsForEntityRecord ? coreStore.hasEditsForEntityRecord("root", "option", optionName) : false,
                        optionResolving: coreStore.isResolving ? coreStore.isResolving("getEntityRecord", [ "root", "option", optionName ]) : false,
                        optionSaving: coreStore.isSavingEntityRecord ? coreStore.isSavingEntityRecord("root", "option", optionName) : false,
                        entityConfig: coreStore.getEntityConfig ? coreStore.getEntityConfig("root", "option", optionName) : null
                    };
                }, [ optionName ]);
                const hasFetchedOption = typeof optionValue !== "undefined" || typeof persistedOptionValue !== "undefined";
                const baseOptionValue = typeof optionValue !== "undefined" ? optionValue : typeof persistedOptionValue !== "undefined" ? persistedOptionValue : (_bootstrap$settings = bootstrap.settings) !== null && _bootstrap$settings !== void 0 ? _bootstrap$settings : buildDefaultSettings(blockDefinitions);
                const normalizedOptionValue = (0, external_wp_element_namespaceObject.useMemo)(() => sanitizeSettingsWithDefinitions(baseOptionValue, blockDefinitions), [ baseOptionValue, blockDefinitions ]);
                const hasSeededFromPersistedRef = (0, external_wp_element_namespaceObject.useRef)(false);
                const hasSeededFallbackRef = (0, external_wp_element_namespaceObject.useRef)(false);
                (0, external_wp_element_namespaceObject.useEffect)(() => {
                    logDebug("Option status", {
                        optionValue: optionValue,
                        persistedOptionValue: persistedOptionValue,
                        hasFetchedOption: hasFetchedOption
                    });
                }, [ optionValue, persistedOptionValue, hasFetchedOption ]);
                (0, external_wp_element_namespaceObject.useEffect)(() => {
                    if (!isEntityConfigReady) {
                        logDebug("Entity config not ready; skipping seed/sync effects");
                        return;
                    }
                    if (!hasFetchedOption && !hasSeededFallbackRef.current && Object.keys(blockDefinitions).length > 0) {
                        var _bootstrap$settings2;
                        const fallbackValue = sanitizeSettingsWithDefinitions((_bootstrap$settings2 = bootstrap.settings) !== null && _bootstrap$settings2 !== void 0 ? _bootstrap$settings2 : buildDefaultSettings(blockDefinitions), blockDefinitions);
                        logDebug("Seeding fallback option value", fallbackValue);
                        hasSeededFallbackRef.current = true;
                        try {
                            editEntityRecord("root", "option", optionName, {
                                value: fallbackValue
                            });
                        } catch (error) {
                            logDebug("Fallback seed via editEntityRecord failed", error);
                            if (receiveEntityRecords) {
                                receiveEntityRecords("root", "option", [ {
                                    id: optionName,
                                    name: optionName,
                                    value: fallbackValue
                                } ], {
                                    name: optionName
                                });
                            }
                        }
                        return;
                    }
                    if (!hasSeededFromPersistedRef.current && typeof optionValue === "undefined" && typeof persistedOptionValue !== "undefined") {
                        const sanitizedPersisted = sanitizeSettingsWithDefinitions(persistedOptionValue, blockDefinitions);
                        logDebug("Seeding edited option with persisted value");
                        hasSeededFromPersistedRef.current = true;
                        editEntityRecord("root", "option", optionName, {
                            value: sanitizedPersisted
                        });
                        return;
                    }
                    if (typeof optionValue !== "undefined" && !isEqual_default()(optionValue, normalizedOptionValue)) {
                        logDebug("Syncing edited option to normalized snapshot");
                        editEntityRecord("root", "option", optionName, {
                            value: normalizedOptionValue
                        });
                    }
                }, [ optionValue, persistedOptionValue, normalizedOptionValue, optionName, editEntityRecord, receiveEntityRecords, blockDefinitions, isEntityConfigReady ]);
                (0, external_wp_element_namespaceObject.useEffect)(() => {
                    broadcastSettingsUpdate(normalizedOptionValue);
                }, [ normalizedOptionValue ]);
                const isInitialLoad = !hasFetchedOption;
                const isOptionReady = hasFetchedOption;
                const isEntityConfigReady = Boolean(entityConfig);
                const isLoading = isBlockCatalogLoading && isOptionReady;
                const blocksEnabled = normalizedOptionValue.blocks_enabled || {};
                const dateNowApiKey = normalizedOptionValue.date_now_api_key || "";
                const applySettingsChange = (0, external_wp_element_namespaceObject.useCallback)(updater => {
                    if (!isEntityConfigReady) {
                        logDebug("applySettingsChange bail: entity config not ready");
                        return;
                    }
                    if (!isOptionReady) {
                        logDebug("applySettingsChange bail: option not ready");
                        return;
                    }
                    const nextValue = sanitizeSettingsWithDefinitions(updater(normalizedOptionValue), blockDefinitions);
                    editEntityRecord("root", "option", optionName, {
                        value: nextValue
                    });
                }, [ editEntityRecord, optionName, normalizedOptionValue, blockDefinitions, isOptionReady, isEntityConfigReady ]);
                const fetchBlockCatalog = (0, external_wp_element_namespaceObject.useCallback)(async ({search: search = "", page: page = 1, append: append = false} = {}) => {
                    if (!blocksEndpoint) {
                        return;
                    }
                    setBlockCatalogError(null);
                    if (append) {
                        setIsCatalogLoadingMore(true);
                    } else {
                        setIsBlockCatalogLoading(true);
                    }
                    try {
                        const requestUrl = (0, external_wp_url_namespaceObject.addQueryArgs)(blocksEndpoint, {
                            per_page: CATALOG_PAGE_SIZE,
                            page: page,
                            ...search ? {
                                search: search
                            } : {}
                        });
                        const response = await external_wp_apiFetch_default()({
                            url: requestUrl,
                            method: "GET",
                            parse: false
                        });
                        const payload = await response.json();
                        if (!response.ok) {
                            throw payload;
                        }
                        const total = parseInt(response.headers.get("X-WP-Total"), 10) || payload.length || 0;
                        const totalPages = parseInt(response.headers.get("X-WP-TotalPages"), 10) || Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
                        const mapped = toDefinitionMap(Array.isArray(payload) ? payload : []);
                        let mergedDefinitions = mapped;
                        setBlockDefinitions(previous => {
                            mergedDefinitions = append ? {
                                ...previous,
                                ...mapped
                            } : mapped;
                            return mergedDefinitions;
                        });
                        setCatalogMeta({
                            page: page,
                            totalPages: totalPages,
                            search: search
                        });
                    } catch (err) {
                        setBlockCatalogError(err);
                        if (!append) {
                            setCatalogMeta({
                                page: 0,
                                totalPages: 0,
                                search: search
                            });
                        }
                    } finally {
                        if (append) {
                            setIsCatalogLoadingMore(false);
                        } else {
                            setIsBlockCatalogLoading(false);
                        }
                    }
                }, [ blocksEndpoint ]);
                (0, external_wp_element_namespaceObject.useEffect)(() => {
                    if (!blocksEndpoint) {
                        return;
                    }
                    fetchBlockCatalog({
                        search: debouncedSearchTerm,
                        page: 1,
                        append: false
                    });
                }, [ blocksEndpoint, debouncedSearchTerm, fetchBlockCatalog ]);
                const toggleBlock = (0, external_wp_element_namespaceObject.useCallback)(blockName => {
                    applySettingsChange(current => ({
                        ...current,
                        blocks_enabled: {
                            ...current.blocks_enabled,
                            [blockName]: !current.blocks_enabled?.[blockName]
                        }
                    }));
                }, [ applySettingsChange ]);
                const handleDateNowApiKeyChange = (0, external_wp_element_namespaceObject.useCallback)(value => {
                    applySettingsChange(current => ({
                        ...current,
                        date_now_api_key: value
                    }));
                }, [ applySettingsChange ]);
                const hasMoreBlocks = catalogMeta.page > 0 && catalogMeta.page < catalogMeta.totalPages;
                const isDateNowEnabled = (_blocksEnabled$yokoi = blocksEnabled?.["yokoi/date-now"]) !== null && _blocksEnabled$yokoi !== void 0 ? _blocksEnabled$yokoi : true;
                const loadMoreBlocks = (0, external_wp_element_namespaceObject.useCallback)(() => {
                    if (!blocksEndpoint) {
                        return;
                    }
                    if (catalogMeta.page >= catalogMeta.totalPages) {
                        return;
                    }
                    fetchBlockCatalog({
                        search: catalogMeta.search,
                        page: catalogMeta.page + 1,
                        append: true
                    });
                }, [ blocksEndpoint, catalogMeta, fetchBlockCatalog ]);
                const handleReset = (0, external_wp_element_namespaceObject.useCallback)(() => {
                    var _ref;
                    if (!isOptionReady) {
                        return;
                    }
                    const baselineSource = (_ref = persistedOptionValue !== null && persistedOptionValue !== void 0 ? persistedOptionValue : bootstrap.settings) !== null && _ref !== void 0 ? _ref : buildDefaultSettings(blockDefinitions);
                    const baseline = sanitizeSettingsWithDefinitions(baselineSource, blockDefinitions);
                    editEntityRecord("root", "option", optionName, {
                        value: baseline
                    });
                }, [ persistedOptionValue, editEntityRecord, optionName, blockDefinitions, isOptionReady, bootstrap ]);
                const hasUnsavedChanges = optionDirty;
                const isSavingChanges = optionSaving;
                const isBusy = isSavingChanges || isBlockCatalogLoading;
                if (!canManage) {
                    return (0, external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_element_namespaceObject.Fragment, {
                        children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)(PluginSidebarMoreMenuItem, {
                            target: "yokoi-settings-sidebar",
                            icon: "admin-settings",
                            children: (0, external_wp_i18n_namespaceObject.__)("Yokoi Settings", "yokoi")
                        }), (0, external_ReactJSXRuntime_namespaceObject.jsx)(PluginSidebar, {
                            name: "yokoi-settings-sidebar",
                            title: (0, external_wp_i18n_namespaceObject.__)("Yokoi Settings", "yokoi"),
                            icon: "admin-settings",
                            children: (0, external_ReactJSXRuntime_namespaceObject.jsx)("p", {
                                children: (0, external_wp_i18n_namespaceObject.__)("You do not have permission to manage Yokoi settings.", "yokoi")
                            })
                        }) ]
                    });
                }
                return (0, external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_element_namespaceObject.Fragment, {
                    children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)(SitePluginSidebarMoreMenuItem, {
                        target: "yokoi-settings-sidebar",
                        icon: (0, external_ReactJSXRuntime_namespaceObject.jsx)(YokoiSidebarIcon, {}),
                        children: (0, external_wp_i18n_namespaceObject.__)("Yokoi Settings", "yokoi")
                    }), (0, external_ReactJSXRuntime_namespaceObject.jsx)(SitePluginSidebar, {
                        name: "yokoi-settings-sidebar",
                        title: (0, external_wp_i18n_namespaceObject.__)("Yokoi Settings", "yokoi"),
                        icon: (0, external_ReactJSXRuntime_namespaceObject.jsx)(YokoiSidebarIcon, {}),
                        children: (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
                            direction: "column",
                            gap: 6,
                            children: isInitialLoad ? (0, external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
                                className: "yokoi-sidebar__loading-shell",
                                children: [ (0, external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
                                    className: "yokoi-sidebar__loading-panel",
                                    children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}), (0, 
                                    external_ReactJSXRuntime_namespaceObject.jsx)("p", {
                                        children: (0, external_wp_i18n_namespaceObject.__)("Preparing Yokoi settings…", "yokoi")
                                    }), (0, external_ReactJSXRuntime_namespaceObject.jsx)("div", {
                                        className: "yokoi-sidebar__loading-bar"
                                    }), (0, external_ReactJSXRuntime_namespaceObject.jsx)("div", {
                                        className: "yokoi-sidebar__loading-bar yokoi-sidebar__loading-bar--short"
                                    }) ]
                                }), (0, external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
                                    className: "yokoi-sidebar__loading-panel yokoi-sidebar__loading-panel--secondary",
                                    children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)("div", {
                                        className: "yokoi-sidebar__loading-bar"
                                    }), (0, external_ReactJSXRuntime_namespaceObject.jsx)("div", {
                                        className: "yokoi-sidebar__loading-bar yokoi-sidebar__loading-bar--short"
                                    }) ]
                                }) ]
                            }) : (0, external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
                                children: [ isLoading && (0, external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Flex, {
                                    direction: "column",
                                    gap: 4,
                                    children: [ (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}), (0, 
                                    external_ReactJSXRuntime_namespaceObject.jsx)("p", {
                                        children: (0, external_wp_i18n_namespaceObject.__)("Updating settings…", "yokoi")
                                    }) ]
                                }), (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
                                    status: "info",
                                    isDismissible: false,
                                    children: (0, external_wp_i18n_namespaceObject.__)("Yokoi ships a suite of high-performance blocks built for modern WordPress sites. Use the controls below to enable blocks and fine-tune their behavior.", "yokoi")
                                }), (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TabPanel, {
                                    initialTabName: "catalog",
                                    tabs: [ {
                                        name: "catalog",
                                        title: (0, external_wp_i18n_namespaceObject.__)("Blocks", "yokoi")
                                    }, {
                                        name: "settings",
                                        title: (0, external_wp_i18n_namespaceObject.__)("Settings", "yokoi")
                                    } ],
                                    children: tab => {
                                        if (tab.name === "settings") {
                                            return (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
                                                direction: "column",
                                                gap: 4,
                                                children: !isDateNowEnabled ? (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
                                                    status: "info",
                                                    isDismissible: false,
                                                    children: (0, external_wp_i18n_namespaceObject.__)("Enable the Date.now block to configure Google Calendar access.", "yokoi")
                                                }) : (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
                                                    label: (0, external_wp_i18n_namespaceObject.__)("Google Calendar API key", "yokoi"),
                                                    value: dateNowApiKey,
                                                    onChange: handleDateNowApiKeyChange,
                                                    placeholder: (0, external_wp_i18n_namespaceObject.__)("Paste your Google API key", "yokoi"),
                                                    help: (0, external_wp_i18n_namespaceObject.__)("Create a Maps Platform project, enable Calendar API access, and paste the key here.", "yokoi"),
                                                    disabled: !isOptionReady || isBusy
                                                })
                                            });
                                        }
                                        return (0, external_ReactJSXRuntime_namespaceObject.jsx)(components_BlockTogglePanel, {
                                            isLoading: isBlockCatalogLoading,
                                            isLoadingMore: isCatalogLoadingMore,
                                            error: blockCatalogError,
                                            searchValue: searchTerm,
                                            onSearchChange: setSearchTerm,
                                            hasMore: hasMoreBlocks,
                                            onLoadMore: loadMoreBlocks,
                                            blocksEnabled: blocksEnabled,
                                            blockDefinitions: blockDefinitions,
                                            onToggle: toggleBlock,
                                            disabled: !isOptionReady || isBusy
                                        });
                                    }
                                }), (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
                                    justify: "flex-end",
                                    gap: 2,
                                    children: (0, external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
                                        variant: "secondary",
                                        onClick: handleReset,
                                        isBusy: isBusy,
                                        disabled: isBusy || !hasUnsavedChanges || !isOptionReady,
                                        children: (0, external_wp_i18n_namespaceObject.__)("Reset", "yokoi")
                                    })
                                }) ]
                            })
                        })
                    }) ]
                });
            };
            external_wp_domReady_default()(() => {
                const editorPackage = window?.wp?.editor;
                const editSite = window?.wp?.editSite;
                const bodyHasSiteEditorClass = document?.body?.classList?.contains("site-editor-php") || document?.body?.classList?.contains("edit-site");
                if (!editSite || !bodyHasSiteEditorClass) {
                    return;
                }
                const source = editorPackage?.PluginSidebar && editorPackage?.PluginSidebarMoreMenuItem ? editorPackage : editSite;
                const {PluginSidebar: PluginSidebar, PluginSidebarMoreMenuItem: PluginSidebarMoreMenuItem} = source || {};
                if (!PluginSidebar || !PluginSidebarMoreMenuItem) {
                    return;
                }
                SitePluginSidebar = PluginSidebar;
                SitePluginSidebarMoreMenuItem = PluginSidebarMoreMenuItem;
                (0, external_wp_plugins_namespaceObject.registerPlugin)("yokoi-settings-sidebar", {
                    render: YokoiSidebar,
                    icon: YokoiSidebarIcon
                });
                scheduleSidebarOpen();
            });
        }
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        var module = __webpack_module_cache__[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }
    __webpack_require__.m = __webpack_modules__;
    (() => {
        var deferred = [];
        __webpack_require__.O = (result, chunkIds, fn, priority) => {
            if (chunkIds) {
                priority = priority || 0;
                for (var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
                deferred[i] = [ chunkIds, fn, priority ];
                return;
            }
            var notFulfilled = Infinity;
            for (var i = 0; i < deferred.length; i++) {
                var [chunkIds, fn, priority] = deferred[i];
                var fulfilled = true;
                for (var j = 0; j < chunkIds.length; j++) {
                    if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(key => __webpack_require__.O[key](chunkIds[j]))) {
                        chunkIds.splice(j--, 1);
                    } else {
                        fulfilled = false;
                        if (priority < notFulfilled) notFulfilled = priority;
                    }
                }
                if (fulfilled) {
                    deferred.splice(i--, 1);
                    var r = fn();
                    if (r !== undefined) result = r;
                }
            }
            return result;
        };
    })();
    (() => {
        __webpack_require__.n = module => {
            var getter = module && module.__esModule ? () => module["default"] : () => module;
            __webpack_require__.d(getter, {
                a: getter
            });
            return getter;
        };
    })();
    (() => {
        __webpack_require__.d = (exports, definition) => {
            for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                    Object.defineProperty(exports, key, {
                        enumerable: true,
                        get: definition[key]
                    });
                }
            }
        };
    })();
    (() => {
        __webpack_require__.g = function() {
            if (typeof globalThis === "object") return globalThis;
            try {
                return this || new Function("return this")();
            } catch (e) {
                if (typeof window === "object") return window;
            }
        }();
    })();
    (() => {
        __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
        __webpack_require__.nmd = module => {
            module.paths = [];
            if (!module.children) module.children = [];
            return module;
        };
    })();
    (() => {
        var installedChunks = {
            sidebar: 0,
            "./style-sidebar": 0
        };
        __webpack_require__.O.j = chunkId => installedChunks[chunkId] === 0;
        var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
            var [chunkIds, moreModules, runtime] = data;
            var moduleId, chunkId, i = 0;
            if (chunkIds.some(id => installedChunks[id] !== 0)) {
                for (moduleId in moreModules) {
                    if (__webpack_require__.o(moreModules, moduleId)) {
                        __webpack_require__.m[moduleId] = moreModules[moduleId];
                    }
                }
                if (runtime) var result = runtime(__webpack_require__);
            }
            if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
            for (;i < chunkIds.length; i++) {
                chunkId = chunkIds[i];
                if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
                    installedChunks[chunkId][0]();
                }
                installedChunks[chunkId] = 0;
            }
            return __webpack_require__.O(result);
        };
        var chunkLoadingGlobal = globalThis["webpackChunkyokoi"] = globalThis["webpackChunkyokoi"] || [];
        chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
        chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
    })();
    var __webpack_exports__ = __webpack_require__.O(undefined, [ "./style-sidebar" ], () => __webpack_require__("./src/sidebar/index.js"));
    __webpack_exports__ = __webpack_require__.O(__webpack_exports__);
})();