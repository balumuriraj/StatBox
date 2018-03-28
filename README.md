# StatBox

Movie
 - id: number
 - title: string
 - description: string
 - releaseDate: Date
 - runtime: number
 - certification: string
 - genreList: string[]
 - poster: string
 - images: string
 - cast: number[] // RoleId
 - crew: number[] // RoleId
 - rating: number
 - criticScore: number
 - reviewIds: number[] // ReviewId
 
Role
 - id: number
 - celebId: number
 - movieId: number
 - index: number
 - category: string
 - type: string

Review
 - id: number
 - userId: number
 - movieId: number
 - rating: number
 

User
 - id: number
 - name: string
 - avatar: string
 - wishList: number[] // movieId
 
 
Celeb
 - id: number
 - name: string
 - hash: string
 - photo: string
 - birthDate: Date
