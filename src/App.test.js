import { render, screen } from '@testing-library/react'
import App from './App'
import axios from 'axios'
import { mockTopTracks } from './mockTopTracks'

jest.mock('axios')

describe('App', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue(mockTopTracks)
    render(<App />)
  })
  it ('displays artists by count of tracks in top fifty', async () => {
    const el = await screen.findByTestId('artist-track-display')
    expect(el).toHaveTextContent(
      'Doja Cat — 5 songs in the top 50'
    )
  })
  it ('displays artists with playcounts divis by 9 in top half', async () => {
    const el = await screen.findByTestId('artist-playcount-display')
    expect(el).toHaveTextContent(
      'Kanye West — 21923361 plays'
    )
    expect(el).not.toHaveTextContent('Mitksi')
  })
})
