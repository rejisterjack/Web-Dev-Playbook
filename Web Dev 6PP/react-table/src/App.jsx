import { useTable, useSortBy, usePagination } from "react-table"

const data = [
  { id: 1, name: "John Doe", gender: "Male", salary: 50000,},
  { id: 2, name: "Jane Smith", gender: "Female", salary: 60000 },
  { id: 3, name: "Mike Johnson", gender: "Male", salary: 55000 },
  { id: 4, name: "Emily Davis", gender: "Female", salary: 65000 },
  { id: 5, name: "David Brown", gender: "Male", salary: 70000 },
  { id: 6, name: "Sarah Wilson", gender: "Female", salary: 55000 },
  { id: 7, name: "Michael Lee", gender: "Male", salary: 60000 },
  { id: 8, name: "Jessica Taylor", gender: "Female", salary: 65000 },
  { id: 9, name: "Daniel Clark", gender: "Male", salary: 55000 },
  { id: 10, name: "Sophia Anderson", gender: "Female", salary: 70000 },
  { id: 11, name: "Matthew Martinez", gender: "Male", salary: 50000 },
  { id: 12, name: "Olivia Thomas", gender: "Female", salary: 60000 },
  { id: 13, name: "Ethan Rodriguez", gender: "Male", salary: 55000 },
  { id: 14, name: "Ava Harris", gender: "Female", salary: 65000 },
  { id: 15, name: "Noah Walker", gender: "Male", salary: 70000 },
  { id: 16, name: "Isabella Young", gender: "Female", salary: 55000 },
  { id: 17, name: "Liam Turner", gender: "Male", salary: 60000 },
  { id: 18, name: "Mia White", gender: "Female", salary: 65000 },
  { id: 19, name: "Lucas Scott", gender: "Male", salary: 55000 },
  { id: 20, name: "Charlotte King", gender: "Female", salary: 70000 },
  { id: 21, name: "Emma Wilson", gender: "Female", salary: 55000 },
  { id: 22, name: "James Thompson", gender: "Male", salary: 60000 },
  { id: 23, name: "Grace Davis", gender: "Female", salary: 65000 },
  { id: 24, name: "Benjamin Anderson", gender: "Male", salary: 55000 },
  { id: 25, name: "Chloe Martinez", gender: "Female", salary: 70000 },
]

// static columns
// const columns = [
//   { Header: "ID", accessor: "id" },
//   { Header: "Name", accessor: "name" },
//   { Header: "Gender", accessor: "gender" },
//   { Header: "Salary", accessor: "salary" },
// ]

// generated columns from data
const columns = Object.keys(data[0]).map((key) => ({
  Header: key,
  accessor: key,
}))

const App = () => {
  const {
    getTableBodyProps,
    getTableProps,
    headerGroups,
    rows,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex },
    pageCount,
    gotoPage,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    useSortBy,
    usePagination
  )
  return (
    <div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((hg) => (
            <tr key={hg.id} {...hg.getHeaderGroupProps()}>
              {hg.headers.map((column) => (
                <th
                  key={column.id}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {/* {rows.map((row) => {
            prepareRow(row)
            return (
              <tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td key={cell.id} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </td>
                  )
                })}
              </tr>
            )
          })} */}

          {page.map((row) => {
            prepareRow(row)
            return (
              <tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td key={cell.id} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>

        <tfoot>
          <tr>
            <td>
              <button
                onClick={() => gotoPage(0)}
                disabled={pageIndex === 0}
                className="btn btn-sm btn-primary"
              >
                {"<<"}
              </button>{" "}
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="btn btn-sm btn-primary"
              >
                {"<"}
              </button>{" "}
              <span>
                {pageIndex + 1} of {pageCount}
              </span>{" "}
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="btn btn-sm btn-primary"
              >
                {">"}
              </button>{" "}
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={pageIndex === pageCount - 1}
                className="btn btn-sm btn-primary"
              >
                {">>"}
              </button>{" "}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default App
