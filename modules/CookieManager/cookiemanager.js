'use strict'

/* Browser Detection
----------------------------------------------------------------------------- */
const _BROWSER_IS_IE =
    (document.all
     && window.ActiveXObject
     && navigator.userAgent.toLowerCase().indexOf("msie") > -1
     && navigator.userAgent.toLowerCase().indexOf("opera") == -1);

/**
 * I hate navigator string based browser detection too, but when Opera alone
 * chokes on cookies containing double quotes...
 */
const _BROWSER_IS_OPERA =
    (navigator.userAgent.toLowerCase().indexOf("opera") != -1);

/* CookieManager Object
----------------------------------------------------------------------------- */
/**
 * Provides a simple interface for creating, retrieving and clearing cookies.
 *
 * @author Jonathan Buchanan
 * @version 0.8
 */
export default class CookieManager {
  constructor(userDataForIE = false){
    this.cookieShelfLife = 365;

    /**
     * Determines if this object will use IE's proprietary userData behaviour
     * instead of cookies for storage.
     */
    this.userDataForIE = userDataForIE;

    // Internet Explorer has a cookie handling bug - if the *combined size*
    // of all cookies stored for a given domain is greater than 4096 bytes,
    // document.cookie will return an empty string. Until this is fixed , we
    // will fall back on IE's proprietary userData behaviour.
    if(_BROWSER_IS_IE && this.userDataForIE){
      this.IE_CACHE_NAME = "storage"
      if(document.getElementById(this.IE_CACHE_NAME) == null){
        var div = document.createElement("DIV")
        div.id = this.IE_CACHE_NAME
        document.body.appendChild(div)
      }
      this.store = document.getElementById(this.IE_CACHE_NAME)
      this.store.style.behavior = "url('#default#userData')"
    }
  }

  /**
   * Returns the value of a cookie with the given name, or <code>null</code>
   * if no such cookie exists.
   */
  getCookie(aCookieName){
    let result = null

    if(_BROWSER_IS_IE && this.userDataForIE){
      this.store.load(this.IE_CACHE_NAME);
      result = this.store.getAttribute(aCookieName);
    }else{
      for (var i = 0; i < document.cookie.split('; ').length; i++){
        const crumb = document.cookie.split('; ')[i].split('=')
        if(crumb[0] == aCookieName && crumb[1] != null){
          result = crumb[1]
          break
        }
      }
    }

    if(_BROWSER_IS_OPERA && result != null){
      result = result.replace(/%22/g, '"')
    }
    return result
  }

  /**
   * Sets a cookie with the given name and value.
   */
  setCookie(aCookieName, aCookieValue){
    if(_BROWSER_IS_IE && this.userDataForIE){
      this.store.setAttribute(aCookieName, aCookieValue)
      this.store.save(this.IE_CACHE_NAME)
    }else{
      if(_BROWSER_IS_OPERA){
        aCookieValue = aCookieValue.replace(/"/g, "%22")
      }
      const date = new Date();
      date.setTime(date.getTime() + (this.cookieShelfLife * 24*60*60*1000))
      const expires = '; expires=' + date.toGMTString()
      document.cookie = aCookieName + '=' + aCookieValue + expires + ';';
      //document.cookie = aCookieName + '=' + aCookieValue + expires + '; path=/';
    }
  }

  /**
   * Clears the cookie with the given name.
   */
  clearCookie(aCookieName){
    if(_BROWSER_IS_IE && this.userDataForIE){
      this.store.load(this.IE_CACHE_NAME)
      this.store.removeAttribute(aCookieName)
      this.store.save(this.IE_CACHE_NAME)
    }else{
      document.cookie =
          aCookieName + '=;expires=Thu, 01-Jan-1970 00:00:01 GMT;'
          //aCookieName + '=;expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/';
    }
  }
}
