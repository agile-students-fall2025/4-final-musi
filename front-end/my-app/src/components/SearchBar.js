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
}
 
export default SearchBar