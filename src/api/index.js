import request from './request'

/**
 * 获取推荐页Banners
 */
export function getTopBanners() {
  return request({
    url: '/banner',
    method: 'get'
  })
}

/**
 * 获取热门推荐歌单
 * @param  {number} limit
 */
export function getHotRecommends(limit) {
  return request({
    url: `/personalized`,
    method: 'get',
    params: {
      limit
    }
  })
}

/**
 * 获取推荐模块新碟上架
 * @param  {number} limit
 */
export function getNewAlbums(limit) {
  return request({
    url: '/top/album',
    method: 'get',
    params: {
      limit
    }
  })
}

/**
 * 获取推荐模块榜单
 * { 0-云音乐新歌榜，2-云原创歌曲榜，3-云音乐飙升榜 }
 * @param  {number} idx
 */
export function getRecommendRank(idx) {
  return request({
    url: '/top/list',
    method: 'get',
    params: {
      idx
    }
  })
}

/**
 * 获取入驻歌手榜
 * @param  {number} type  -1:全部 1:男歌手 2:女歌手 3:乐队
 * @param  {number} area  -1:全部 7:华语 96:欧美 8:日本 16:韩国 0:其他
 * @param  {number} limit
 */
export function getSettledSingers(type, area, limit) {
  return request({
    url: '/artist/list',
    method: 'get',
    params: {
      type,
      area,
      limit
    }
  })
}

/**
 * 获取热门主播榜
 * @param  {number} limit
 */
export function getHotAnchors(limit) {
  return request({
    url: '/dj/toplist/popular',
    method: 'get',
    params: {
      limit
    }
  })
}

/**
 * 获取歌曲详情，传入歌曲ids（支持多个，用，隔开）
 * @param  {number} ids
 */
export function getSongDetail(ids) {
  return request({
    url: '/song/detail',
    method: 'get',
    params: {
      ids
    }
  })
}
/**
 * 获取歌词
 * @param  {number} id
 */
export function getLyricById(id) {
  return request({
    url: '/lyric',
    method: 'get',
    params: {
      id
    }
  })
}
/**
 * 获取相似歌曲
 * @param  {number} id
 */
export function getSimiSongs(id) {
  return request({
    url: '/simi/song',
    method: 'get',
    params: {
      id
    }
  })
}

/**
 * 获取相似歌单
 * @param  {number} id
 */
export function getSimiPlayList(id) {
  return request({
    url: `/simi/playlist`,
    method: 'get',
    params: {
      id
    }
  })
}
/**
 * 获取榜单
 */
export function getTopList() {
  return request({
    url: "/toplist"
  })
}

/**
 * 获取榜单详情
 * @param  {} id
 */
export function getRankingList(id) {
  return request({
    url: "/playlist/detail",
    params: {
      id
    }
  })
}

export function getSongCategory() {
  return request({
    url: "/playlist/catlist"
  })
}

export function getSongCategoryList(cat="全部", offset=0, limit = 35) {
  return request({
    url: "/top/playlist",
    params: {
      cat,
      limit,
      offset
    }
  })
}