import React from 'react';

const MediaAsset = ({ item }) => {
  if (item.type === 'video') {
    return (
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        preload="none"
        title={item.title}
      >
        <source src={item.url} type="video/mp4" />
      </video>
    );
  }
  
  if (item.type === 'gif') {
    return <img src={item.url} alt={item.title} loading="lazy" />;
  }

  return null;
};

export default MediaAsset;
