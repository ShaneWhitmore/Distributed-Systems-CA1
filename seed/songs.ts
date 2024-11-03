import { Song } from '../shared/types'

export const songs: Song[] = [
    {
        id: 1,
        genre: ['Pop'],
        original_language: 'en',
        original_title: 'Good News',
        artist: 'Mac Miller',
        adult: false,
        release_date: '2020-01-09',
        title: 'Good News'
    },
    {
        id: 2,
        genre: ['Rock', 'Blues'],
        original_language: 'en',
        original_title: 'Sin City',
        artist: 'ACDC',
        adult: true,
        release_date: '1978-05-05',
        title: 'Sin City'
    },
    {
        id: 3,
        genre: ['Rock', 'Grunge'],
        original_language: 'en',
        original_title: "Molly's lips",
        artist: 'Nirvana',
        adult: true,
        release_date: '1991-01-21',
        title: "Molly's lips"
    }

]
