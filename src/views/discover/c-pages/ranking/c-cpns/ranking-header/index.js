import React, {memo} from 'react';
import { useSelector, shallowEqual } from "react-redux";

import { formatMonthDay } from "@/utils/format-utils";

import CoSongOperationBar from '@/components/song-operation-bar';
import {
  RankingHeaderWrapper
} from './style';

export default memo(function CoRankingHeader() {
  // redux
  const state = useSelector(state => ({
    playList: state.getIn(["ranking", "playList"]),
  }), shallowEqual);
  const topInfo = state.playList;

  return (
    <RankingHeaderWrapper>
      <div className="image">
        <img src={topInfo.coverImgUrl} alt="" />
        <span className="image_cover">封面</span>
      </div>
      <div className="info">
        <div className="title">{topInfo.name}</div>
        <div className="time">
          <i className="clock sprite_icon2"></i>
          <div>最近更新：{formatMonthDay(topInfo.updateTime)}</div>
          <div className="update-f">（{"每日更新:TODO"}）</div>
        </div>
        <CoSongOperationBar favorTitle={`(${topInfo.subscribedCount})`}
                            shareTitle={`(${topInfo.shareCount})`}
                            downloadTitle="下载"
                            commentTitle={`(${topInfo.commentCount})`}/>
      </div>
    </RankingHeaderWrapper>
  )
})
