// Sample data for authors and books
const data = {
  authors: [
    { id: '1', name: 'J.K. Rowling', bookIds: ['1', '2', '3'] },
    { id: '2', name: 'J.R.R. Tolkien', bookIds: ['4', '5', '6'] },
    { id: '3', name: 'George R.R. Martin', bookIds: ['7', '8', '9'] },
    { id: '4', name: 'Stephen King', bookIds: ['10', '11', '12'] },
    { id: '5', name: 'Agatha Christie', bookIds: ['13', '14', '15'] },
  ],

  books: [
    {
      id: '1',
      title: "Harry Potter and the Philosopher's Stone",
      publishedYear: 1997,
      authorId: '1',
    },
    {
      id: '2',
      title: 'Harry Potter and the Chamber of Secrets',
      publishedYear: 1998,
      authorId: '1',
    },
    {
      id: '3',
      title: 'Harry Potter and the Prisoner of Azkaban',
      publishedYear: 1999,
      authorId: '1',
    },
    { id: '4', title: 'The Hobbit', publishedYear: 1937, authorId: '2' },
    {
      id: '5',
      title: 'The Fellowship of the Ring',
      publishedYear: 1954,
      authorId: '2',
    },
    { id: '6', title: 'The Two Towers', publishedYear: 1954, authorId: '2' },
    { id: '7', title: 'A Game of Thrones', publishedYear: 1996, authorId: '3' },
    { id: '8', title: 'A Clash of Kings', publishedYear: 1998, authorId: '3' },
    { id: '9', title: 'A Storm of Swords', publishedYear: 2000, authorId: '3' },
    { id: '10', title: 'The Shining', publishedYear: 1977, authorId: '4' },
    { id: '11', title: 'It', publishedYear: 1986, authorId: '4' },
    { id: '12', title: 'The Stand', publishedYear: 1978, authorId: '4' },
    {
      id: '13',
      title: 'Murder on the Orient Express',
      publishedYear: 1934,
      authorId: '5',
    },
    {
      id: '14',
      title: 'And Then There Were None',
      publishedYear: 1939,
      authorId: '5',
    },
    {
      id: '15',
      title: 'Death on the Nile',
      publishedYear: 1937,
      authorId: '5',
    },
  ],
}

// Initialize ID counters based on existing data
let authorId =
  data.authors.length > 0
    ? Math.max(...data.authors.map((a) => parseInt(a.id)))
    : 0
let bookId =
  data.books.length > 0 ? Math.max(...data.books.map((b) => parseInt(b.id))) : 0

const resolvers = {
  Book: {
    author: (parent, args, context, info) => {
      return data.authors.find((author) => author.id === parent.authorId)
    },
  },
  Author: {
    books: (parent, args, context, info) => {
      return data.books.filter((book) => parent.bookIds.includes(book.id))
    },
  },
  Query: {
    authors: () => data.authors,
    books: () => data.books,
  },
  Mutation: {
    addAuthor: (_, { name }) => {
      const author = {
        id: String(++authorId),
        name,
        bookIds: [],
      }
      data.authors.push(author)
      return author
    },
    addBook: (_, { title, publishedYear, authorId }) => {
      const book = {
        id: String(++bookId),
        title,
        publishedYear,
        authorId,
      }
      data.books.push(book)
      return book
    },
  },
}

export default resolvers
