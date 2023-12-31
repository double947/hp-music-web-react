import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Slider, message } from 'antd'
import dayjs from 'dayjs'

import CoAppPlayerPanel from '../app-player-panel'
import { AppPlayerBarWrapper, Control, PlayInfo, Operator } from './style'
import { changePlaySequenceAction, getSongDetailAction, changePlaySongAction, changeCurrentLyricIndexAction, changeIsPlayingAction } from '../store/actionCreators'
import { getSizeImage, getPlayUrl } from 'utils/format-utils'

export default memo(function AppPlayerBar() {
  /* state */
  const [duration, setDuration] = useState(0)  // 歌曲总时长
  const [currentTime, setCurrentTime] = useState(0) // 歌曲播放的当前时间点
  const [progress, setProgress] = useState(0)  // 歌曲进度
  const [isChanging, setIsChanging] = useState(false) // 是否正在手动改变进度条
  // const [isPlaying, setIsPlaying] = useState(false)  // 是否正在播放
  const [showPlayerPanel, setShowPlayerPanel] = useState(false)

  /* redux */
  const dispatch = useDispatch()
  const { playList, currentSong, playSequence, lyricList, currentLyricIndex, isPlaying } = useSelector((state) => ({
    playList: state.getIn(['player', 'playList']),
    currentSong: state.getIn(['player', 'currentSong']),
    playSequence: state.getIn(['player', 'playSequence']),
    lyricList: state.getIn(['player', 'lyricList']),
    currentLyricIndex: state.getIn(['player', 'currentLyricIndex']),
    isPlaying: state.getIn(['player', 'isPlaying'])
  }), shallowEqual)
  /* hooks */
  const playerRef = useRef()
  useEffect(() => {
    // dispatch(getSongDetailAction(1330348068))
  }, [dispatch])

  useEffect(() => {
    let currentSongId = null
    try {
      currentSongId = JSON.parse(localStorage.getItem('currentSong')).id
    } catch (err) {
      console.log(err)
    }
    if (!currentSongId) return
    dispatch(getSongDetailAction(currentSongId))
  }, [dispatch])

  // 只有在歌曲id发生改变的时候才需要重新设置播放src
  useEffect(() => {
    playerRef.current.src = getPlayUrl(currentSong.id)

    // 切歌后主动调用play(),且audio的play方法返回的是一个Promise
    playerRef.current.play()
      .then(() => {
        dispatch(changeIsPlayingAction(true))
      }).catch(() => {
        dispatch(changeIsPlayingAction(false))
      })
    setDuration(currentSong.dt)
    document.title = currentSong.name ? `${currentSong.name} - ${currentSong.ar && currentSong.ar[0].name }` : "Music"
  }, [currentSong, dispatch])

  /* other handle */
  const picUrl = (currentSong.al && currentSong.al.picUrl) || ''
  const singerName = (currentSong.ar && currentSong.ar[0].name) || '未知歌手'
  
  /* other function */
  const playMusic = useCallback(() => {
    isPlaying ? playerRef.current.pause() : playerRef.current.play()
    // 每次切换播放状态后需要对isPlaying取反
    dispatch(changeIsPlayingAction(!isPlaying))
  }, [dispatch, isPlaying])

  const timeUpdate = (e) => {
    // console.log('timeUpdate', currentTime / duration *100, currentTime)
    
    // 只有在非正在手动改变进度的时候才根据自然时间来设置当前播放时间点和更新进度条
    if (!isChanging) {
      setCurrentTime(e.target.currentTime * 1000)
      setProgress(e.target.currentTime * 1000 / duration *100)
    }

    // 获取当前时间点的歌词
    let lyricIndex = 0
    for (let i = 0; i < lyricList.length; i++) {  // 对歌词列表进行遍历
      const lyricItem = lyricList[i];
      if (lyricItem.time > e.target.currentTime * 1000) {  // 用歌词列表中每一项的time与currentTime来对比，如果歌词列表某一项的time比currentTime大,
        lyricIndex = i - 1                          // 则说明匹配到了，但此时找到的 i(索引) 需要-1才是要展示的歌词的索引，然后赋值给 lyricIndex
        break                                              // 跳出循环
      }
    }
    // 修改redux中的值
    if (lyricIndex !== currentLyricIndex) {
      dispatch(changeCurrentLyricIndexAction(lyricIndex))
      const content = lyricList[lyricIndex] && lyricList[lyricIndex].content
      message.open({
        key: 'lyric',
        content: content,
        duration: 0,
        className: 'lyric-message'
      })
    }
  }

  const handleMusicEnded = (e) => {
    if (playSequence === 2 || playList.length === 1) { // 播放顺序为单曲循环 或 歌曲列表只有一首歌
      playerRef.current.currentTime = 0
      playerRef.current.play()
    } else {
      dispatch(changePlaySongAction(1))
    }
  }

  // 手动改变进度条回调
  const sliderOnChange = useCallback((value) => {
    // 手动改变进度条时将状态设置为true
    setIsChanging(true)
    // 手动改变时需要设置当前播放时间点
    setCurrentTime(value / 100 * duration)
    setProgress(value)
  }, [duration])

  // 手动改变进度条结束回调
  const sliderOnAfterChange = useCallback((value) => {
    const currentTime =  value / 100 * duration / 1000  // 秒钟s
    // 将当前的歌曲时间设置到audio标签中
    playerRef.current.currentTime = currentTime

    // console.log('sliderOnAfterChange', currentTime)
    // 由于手动改变结束后在上面的 timeUpdate 回调中去setCurrentTime会出现延迟，拿到的currentTime还是手动改变之前的播放时间点，导致出现进度条回弹的bug，所以在此处直接setCurrentTime一次。
    setCurrentTime(currentTime * 1000)

    // 手动改变结束将状态设置为false
    setIsChanging(false)

    // 此时若为暂停状态则调用一下播放方法
    if (!isPlaying) {
      playMusic()
    }
  }, [duration, isPlaying, playMusic])

  const changePlaySequence = useCallback(() => {
    let currentSequence = playSequence + 1
    if (currentSequence > 2) {
      currentSequence = 0
    }
    dispatch(changePlaySequenceAction(currentSequence))
  }, [dispatch, playSequence])

  const changeMusic = useCallback((tag) => {
    dispatch(changePlaySongAction(tag))
  }, [dispatch])

  return (
    <AppPlayerBarWrapper className="sprite_player">
      <div className="flex justify-center items-center content ">
        <Control isPlaying={isPlaying} className="flex justify-around items-center pt1 control">
          <div className="sprite_player prev" onClick={() => { changeMusic(-1) }}></div>
          <div className="sprite_player play" onClick={() => { playMusic() }}></div>
          <div className="sprite_player next" onClick={() => { changeMusic(1) }}></div>
        </Control>
        <PlayInfo className="flex items-center pt1 play-info">
          <div className="relative image">
            <NavLink to="/discover/player">
              <img src={getSizeImage(picUrl, 35)} alt="" />
              <div className="sprite_player cover"></div>
            </NavLink>
          </div>
          <div className="flex flex-column ml1   info">
            <div className="flex fs12 song">
              <div className="mr1 song-name">{currentSong.name}</div>
              <a href="/#" className="singer-name">{singerName}</a>
            </div>
            <div className="flex progress">
              <Slider 
                tooltipVisible={false}
                value={progress}
                onChange={sliderOnChange}
                onAfterChange={sliderOnAfterChange}
              />
              <div className="flex items-center fs12 ml1 time">
                <span className="time-now">{dayjs(currentTime).format('mm:ss')}</span>
                <span className="divider">/</span>
                <span className="time-total">{dayjs(duration).format('mm:ss')}</span>
              </div>
            </div>
          </div>
        </PlayInfo>
        <Operator sequence={playSequence} className="flex operator pt1">
          <div className="flex items-end action">
            <div className="sprite_player mr1 btn favor"></div>
            <div className="sprite_player btn share"></div>
          </div>
          <div className="flex items-end play-control">
            <div className="sprite_player mr1 btn vol"></div>
            <div className="sprite_player mr1 btn loop" onClick={() => {changePlaySequence()}}></div>
            <div className="flex items-center pl3 fs12 sprite_player btn lyric" onClick={e => setShowPlayerPanel(!showPlayerPanel)}>{playList.length}</div>
          </div>
        </Operator>
      </div>
      <audio ref={playerRef} onTimeUpdate={timeUpdate} onEnded={handleMusicEnded} />
      {showPlayerPanel && <CoAppPlayerPanel bgCover={currentSong.al.picUrl} />}
    </AppPlayerBarWrapper>
  )
})
