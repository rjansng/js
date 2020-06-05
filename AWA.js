const cookieName = 'AWABEST'
const cookieKey = 'chavy_cookie_awabest'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)

sign()

function sign() {
  let url = { url: `https://awabest.com/`, headers: { Cookie: cookieVal } }
  url.headers['Host'] = 'awabest.com'
  url.headers['Referer'] = 'https://awabest.com/forum.php'
  url.headers['Accept'] = '*/*'
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
  chavy.get(url, (error, response, data) => {
    signbbs(data.match(/\/source\/plugin\/awa_signin\/images\/signin_no\.png/), data)
  })
  chavy.done()
}

function signbbs(signedmatch, homedata) {
  const title = `${cookieName}`
  let subTitle = ``
  let detail = ``
  if (signedmatch) {
    subTitle = `簽到结果: 成功 (重複簽到)`
    chavy.msg(title, subTitle, detail)
  } else {
    const signmatch = homedata.match(/plugin.php\?id=awa_signin:sign([^\']*)/)
    if (signmatch) {
      let url = { url: `https://awabest.com/${signmatch[0]}&inajax=1&signsubmit=yes&handlekey=signin&emotid=11&referer=https%3A%2F%2Fawabest.com%2F.%2F`, headers: { Cookie: cookieVal } }
      url.headers['Host'] = 'awabest.com'
      url.headers['Referer'] = 'https://awabest.com/forum.php'
      url.headers['Accept'] = '*/*'
      url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
      chavy.get(url, (error, response, data) => {
        chavy.log(`${cookieName}, data: ${data}`)
        if (data.match(/\/source\/plugin\/awa_signin\/images\/signin_no\.png/)) {
          subTitle = `签到结果: 成功`
        } else {
          subTitle = `签到结果: 失败 (未知)`
        }
        chavy.msg(title, subTitle, detail)
      })
    } else {
      subTitle = `签到结果: 失败 (未知)`
      chavy.log(`${cookieName}, homedata: ${homedata}`)
      chavy.msg(title, subTitle, detail)
    }
  }
}
function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }