import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Spinner from './img/Spinner.gif';
import noImage from './img/NoPicture.jpg';
import InfiniteScroll from 'react-infinite-scroll-component';


import './App.css';
import 'react-toastify/dist/ReactToastify.css';


function App() {
	const [searchQuery, setSearchQuery] = useState();
	const [movies, setMovies] = useState([]);
	const [nominations, setNomination] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [error, setError] = useState('');
	const baseUrl = `https://www.omdbapi.com/?s=${searchQuery}&apikey=6ccf3a20&page=${page}`;


	const notify = () => toast.info("Nomination Completed");
	useEffect(() => {
		const savedNominations = JSON.parse(localStorage.getItem('nominations')) || [];
		setNomination(savedNominations);
	}, []);


	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const response = await fetch(baseUrl);
			const data = await response.json();
			if(data.Error === 'Movie not found!'){
				setMovies([]);
				setError(`No result found for "${searchQuery}", try other search query`)
				setLoading(false);
				return;
			}
			setMovies(data.Search);
			setLoading(false);
		} catch (err) {
			setError(err.message)
		}
	}

	const handleNominate = (movie) => {
		if (nominations.length === 5) {
			return notify()
		};	
		if (nominations.length > 3) {
			notify()
		};
		if (!nominations.filter((i) => i.imdbID === movie.imdbID).length)
			setNomination([...nominations, movie]);
		localStorage.setItem(
			'nominations',
			JSON.stringify([...nominations, movie])
		);
	};

	const handleUnNominate = (movie) => {
		const filteredNominations = nominations.filter(
			(i) => i.imdbID !== movie.imdbID
		);
		setNomination(filteredNominations);
		localStorage.setItem('nominations', JSON.stringify(filteredNominations));
	};

	const fetchNext = async() => {
    setPage(page => page + 1)
    const MOVIES = `https://www.omdbapi.com/?s=${searchQuery}&apikey=6ccf3a20&page=${page + 1}`;
      setLoading(true);
      const getMovies = async () => {
				try {
					const response = await fetch(MOVIES);
					const data = await response.json();
					setLoading(false);
					setMovies(movies.concat(...data.Search || []));
				} catch (err) {
					setError(err.message)
				}
      };
      getMovies();
  }




	return (
		<>
		<ToastContainer hideProgressBar />
		<div className='container'>
			<div className='search'>
				<h2 className='title'>The Shoppies</h2>
				<form onSubmit={handleSubmit} className='header-input'>
					<input
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder='Search'
						type='text'
						value={searchQuery}
					/>
					<div className='search-btn'>
						<SearchIcon onClick={handleSubmit} className='header-button' />
					</div>
				</form>
			</div>
			{movies.length ? <p>Result for "{searchQuery}"</p> : null}
			<div className='body-container'>
			<InfiniteScroll className="body-container"
      dataLength={movies.length}
      next={fetchNext}
      hasMore={true}
      >
				<div className='movies-container'>
					{movies.length ?
						movies.map((movie) => {
							const { Title, Year, Poster, imdbID } = movie;
							return (
								<div key={imdbID} className='movie'>
									<img className='poster' src={Poster === "N/A" ? noImage : Poster } alt='poster' />
									<div className='movie-info'>
										<h3>{Title}</h3>
										<p>{Year}</p>
									</div>
									<Button
									color="secondary"
									disabled={
										nominations.filter((i) => i.imdbID === imdbID).length
									}
									onClick={() => handleNominate(movie)}
									 disableElevation>
									Nominate
								</Button>
								</div>
							);
						}): <p>Use the search button to find movies</p>}
						{loading && <img src={Spinner} alt="spinner"/>}
						{error && <p className="error-message">{error}</p>}
				</div>
				</InfiniteScroll>

				<div className='nominations'>
					<p>
						You have nominated {nominations.length} movies,{' '}
						{5 - nominations.length} left
					</p>
					{nominations.length > 0 &&
						nominations.map((i) => (
							<div key={i.imdbID} className='nominee'>
								<p>
									{i.Title} -{i.Year}{' '}
								</p>
								<Button color="secondary" disableElevation onClick={() => handleUnNominate(i)}>
									Remove
								</Button>
							</div>
						))}
				</div>
			</div>
		</div>
		</>
	);
}

export default App;
