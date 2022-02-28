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

  //construct a map where key is unique artist identifier and value is object
  //containing artist name and array of track objects.
  const mapTracksByArtist = () => {
    //helper func for constructing track objects
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

  //sort by number of tracks desc, then artist name asc
  const getSortedArtists = () => {
    return mapTracksByArtist().then(artistMap => {
      if (!_.isEmpty(artistMap)) {
        return _.orderBy(Object.values(artistMap), [
          artist => artist.tracks.length,
          artist => artist.name],
          ['desc', 'asc']
        )
      }
      return []
    })
  }

  //return top portion (as defined by denom) of artists, rounding up
  const getTopPortionOfArtists = (artistList, denom) => {
    if (!_.isEmpty(artists)) {
      return artists.slice(0, Math.ceil(artists.length/denom))
    }
    return []
  }

  //return artists with total playcount divisible by denom
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

  //if no artists yet, get the artists, else display the artists
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
