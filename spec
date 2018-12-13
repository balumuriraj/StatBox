// jsongraph
{
  movies: [
    $ref("moviesById[23]"),
    $ref("moviesById[24]"),
    ...
  ],
  moviesById: {
    23: {
      title: "Indra",
      description: "A telugu movie",
      cert: "U/A",
      poster: "http://statbox.com/indra.jpg",
      runtime: 150,
      releaseDate: 2018-01-25,
      rating: 3.5, (set periodically by procedural call)
      genre: $atom(["Action", "Drama"]),
      cast: [
        $ref("celebsById[12]"),
        $ref("celebsById[14]"),
        ...
      ],
      crew: [
        $ref("celebsById[15]"),
        $ref("celebsById[54]"),
        ...
      ],
      reviews: [
        $ref("reviewsById[5]"),
        $ref("reviewsById[4]"),
        ...
      ]
    },
    ...
  },
  celebsById: {
    12: {
      name: "Chiru",
      photo: "http://statbox.com/chiru.jpg",
      dob: 1977-01-25,
      movies: [
        $ref("moviesById[23]"),
        $ref("moviesById[24]"),
        ...
      ],
    }
  },
  reviewsById: {
    5: {
      critic: $ref("usersById[65]"),
      review: "https://test.com/review.html",
      rating: 4
    },
    ...
  },
  usersById: {
    2: {
      bookmarks: [
        $ref("moviesById[23]"),
        $ref("moviesById[24]"),
        ...
      ],
      favorites: [
        $ref("moviesById[3]"),
        $ref("moviesById[4]"),
        ...
      ],
      ratings: [
        $ref("reviewsById[15]"),
        $ref("reviewsById[14]"),
        ...
      ],
      metadata: {
        ratings: [2.5, 3, 2, 3.5, ...],
        moviesCount: 5,
        movieMinutes: 725,
        genres: [
          {
            genre: "sci-fi",
            count: 5
          }
          ...
        ],
        topActors: [
          {
            celeb: $ref("celebsById[12]"),
            rating: 4.5
          },
          {
            celeb: $ref("celebsById[14]"),
            rating: 3
          },
          ...
        ],
        topDirectors: [
          {
            celeb: $ref("celebsById[15]"),
            rating: 3.5
          },
          {
            celeb: $ref("celebsById[54]"),
            rating: 2.5
          },
          ...
        ],
      }
    }
  }
}