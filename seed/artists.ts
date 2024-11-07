import { Artist, Song} from '../shared/types'


export const artists: Artist[] = [
    {
        id: 1234,
        artistName: 'Kanye West',
        recordLabel: 'GOOD Music',
    },
    {
        id: 5678,
        artistName: 'Mac Miller',
        recordLabel: 'REMember Music',
    },
    {
        id: 1111,
        artistName: 'ACDC',
        recordLabel: 'Record Music',
    },
]

export const songs: Song[] = [
    {
        artistId: 1,
        genre: ['Pop'],
        original_language: 'en',
        title: 'Good News',
        artist: 'Mac Miller',
        release_date: '2020-01-09',
        recordLabel: 'Record Label',
    },
    {
        artistId: 2,
        genre: ['Rock', 'Blues'],
        original_language: 'en',
        title: 'Sin City',
        artist: 'ACDC',
        release_date: '1978-05-05',
        recordLabel: 'Record Label',

    },
    {
        artistId: 3,
        genre: ['Rock', 'Grunge'],
        original_language: 'en',
        title: "Molly's lips",
        artist: 'Nirvana',
        release_date: '1991-01-21',
        recordLabel: 'Record Label',

    }

]


