import React from 'react'
import { Search, Mic } from 'lucide-react'
 
const sampleData = [
  {
    id: 1,
    title: 'Paint it, Black',
    artist: 'The Rolling Stones',
  },
  {
    id: 2,
    title: 'air ride',
    artist: 'Chanpan',
  },
  {
    id: 3,
    title: 'Lilac',
    artist: 'IU',
  },
  {
    id: 4,
    title: 'The Chain',
    artist: 'Fleetwood Mac',
  },
  {
    id: 5,
    title: 'Fire in the belly',
    artist: 'Le Sserafim',
  },
  {
    id: 6,
    title: 'Glassy',
    artist: 'Jo Yuri',
  },
]

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])

    const debounce = (func, delay) => {
        let timeoutId
        return (...args) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }

    const handleSearch = useCallback(
        debounce((term) => {
            if (term.trim() === '') {
                setSearchResults([])
            } 
            else {
                const results = sampleData.filter((item) =>
                    item.title.toLowerCase().includes(term.toLowerCase()),
                )
                setSearchResults(results)
            }
        }, 300),
        [],
    )

    useEffect(() => {
        handleSearch(searchTerm)
    }, [searchTerm, handleSearch])

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value)
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-white p-4">
            <form
                onSubmit={(e) => e.preventDefault()}
                className="mb-8 w-full max-w-2xl"
            >
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 pr-20 text-base shadow-md transition-shadow duration-200 hover:shadow-lg focus:border-gray-300 focus:outline-none"
                        placeholder="Search Google or type a URL"
                    />
                    <div className="absolute right-0 top-0 mr-4 mt-3 flex items-center">
                        <button
                            type="button"
                            className="mr-3 text-gray-400 hover:text-gray-600"
                            onClick={() =>
                                alert(
                                    'Voice search is unsupported',
                                )
                            }
                        >
                            <Mic size={20} />{' '}
                        </button>{' '}
                        <button type="submit" className="text-blue-500 hover:text-blue-600">
                            <Search size={20} />{' '}
                        </button>{' '}
                    </div>{' '}
                </div>{' '}
            </form>{' '}
            {searchResults.length > 0 && (
                <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-md">
                    <h2 className="mb-4 text-xl font-bold"> Search Results: </h2>{' '}
                    <ul>
                        {' '}
                        {searchResults.map((result) => (
                            <li key={result.id} className="mb-2">
                                <a
                                    href={result.url}
                                    className="text-blue-600 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {' '}
                                    {result.title}{' '}
                                </a>{' '}
                            </li>
                        ))}{' '}
                    </ul>{' '}
                </div>
            )}{' '}
        </div>
    )
}
 
export default SearchBar