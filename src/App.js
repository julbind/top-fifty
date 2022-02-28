import React from 'react'
import './App.css'
import axios from 'axios'
import { useState } from 'react'
import _ from 'lodash'

function App() {
  const [artists, setArtists] = useState([])
  const getTopFiftyTracks = () => {
    return axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'chart.gettoptracks',
        api_key: process.env.REACT_APP_LASTFM_API_KEY,
        format: 'json'
      }
    })
    .then(response => {
      return response.data
    })
    .catch(error => {
      return error
    })
  }

  const mapTracksByArtist = () => {

    //helper func for constructing artistMap
    const getTrackObject = (track) => {
      return {
        name: track.name,
        playcount: track.playcount
      }
    }

    const artistMap = {}
    return getTopFiftyTracks().then(data => {
      data.tracks.track.forEach(track => {
        //would have preferred to use mbid, but some artists didn't have mbid
        const artistId = track.artist.url
        const artistEntry = artistMap[artistId]

        if (artistEntry) {
          artistEntry.tracks.push(getTrackObject(track))
        } else {
          artistMap[artistId] = {
            name: track.artist.name,
            tracks: [getTrackObject(track)]
          }
        }
      })
      return artistMap
    })
  }

  const getSortedArtists = () => {
    return mapTracksByArtist().then(artistMap => {
      if (!_.isEmpty(artistMap)) {
        //sort by number of tracks desc, then artist name asc
        return _.orderBy(Object.values(artistMap), [
          artist => artist.tracks.length,
          artist => artist.name],
          ['desc', 'asc']
        )
      }
      return []
    })
  }

  const getTopPortionOfArtists = (artistList, denom) => {
    if (!_.isEmpty(artists)) {
      //return top portion (as defined by denom) of artists, rounding up
      return artists.slice(0, Math.ceil(artists.length/denom))
    }
    return []
  }

  const getArtistsWithDivisiblePlaycounts = (artistList, denom) => {
    const newArtistList = []
    artistList.forEach(artist => {
      //add playcounts
      const totalPlaycount = artist.tracks.reduce((total, next) => {
        return total + parseInt(next.playcount)
      }, 0) //<-- default value
      //check if divisible by denom
      if (totalPlaycount % denom === 0) {
        newArtistList.push({
          name: artist.name,
          playcount: totalPlaycount,
        })
      }
    })
    return newArtistList
  }

  const getArtistTrackDisplay = (artist) => {
    if (artist.tracks) {
      const trackCount = artist.tracks.length
      return <div>
        {artist.name + ' — ' + trackCount +
        (trackCount === 1 ? ' song ' : ' songs ') +
        'in the top 50'}
      </div>
    }
  }

  const getArtistPlaycountDisplay = (artist) => {
    if (artist.playcount) {
      return <div>
        {artist.name + ' — ' + artist.playcount + ' plays'}
      </div>
    }
  }

  let artistDisplay = null
  if (_.isEmpty(artists)) {
    getSortedArtists().then(artists => setArtists(artists))
  } else {
    artistDisplay =
    <React.Fragment>
      <div className="artist-display" data-testid="artist-track-display">
        {artists.map(artist => (
          getArtistTrackDisplay(artist)
        ))}
      </div>
      <div className="artist-display" data-testid="artist-playcount-display">
        {getArtistsWithDivisiblePlaycounts(
          getTopPortionOfArtists(artists, 2), 9).map(artist => (
          getArtistPlaycountDisplay(artist)
        ))}
      </div>
    </React.Fragment>
  }


  return (
    <div className="App">
      <header className="App-header">
        { artistDisplay }
      </header>
    </div>
  );
}

export default App
