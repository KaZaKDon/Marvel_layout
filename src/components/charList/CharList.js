import { Component } from 'react';
import './charList.scss';
import MarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner'
import ErrorMessage from '../errorMessage/ErrorMessage'
import abyss from '../../resources/img/abyss.jpg';

class CharList extends Component {
    state = {
        chars: [],
        loading: true,
        error: false,
        offset: 210,      // стартовое смещение Marvel API
        newItemLoading: false, // для "load more"
        charEnded: false
    };

    marvelService = new MarvelService();

    componentDidMount() {
        this.onRequest();
    }

    onRequest = (offset) => {
        this.setState({ loading: true, error: false });

        this.onCharListLoading();
        this.marvelService
            .getAllCharacters(offset)
            .then(this.onCharsLoaded)
            .catch(this.onError);
    }

    onCharListLoading = () => {
        this.setState({
            newItemLoading: true
        })
    }

    onCharsLoaded = (newChars) => {
        let ended = false
        if (newChars.length < 9) { // Проверяем, есть ли новые персонажи
            ended = true // если меньше лимита, список кончился
        }

        this.setState(({ chars }) => ({
            chars: [...chars, ...newChars],
            loading: false,
            newItemLoading: false,
            offset: this.state.offset + 9,
            charEnded: ended
        }));
    }

    onError = () => {
        this.setState({
            loading: false,
            error: true
        });
    }

    renderItems(arr) {
        const items = arr.map(item => {
            const imgStyle = item.imageAvailable ? { objectFit: 'cover' } : { objectFit: 'contain' };

            return (
                <li 
                className="char__item" 
                key={item.id}
                onClick={() => this.props.onCharSelected(item.id)}>
                    <img src={item.thumbnail || abyss} alt={item.name} style={imgStyle}/>
                    <div className="char__name">{item.name}</div>
                </li>
            );
        });

        return (
            <ul className="char__grid">
                {items}
            </ul>
        );
    }

    render() {
        const { chars, loading, error, newItemLoading, offset, charEnded } = this.state;

        const errorMessage = error ? <ErrorMessage/> : null;
        const spinner = loading ? <Spinner/> : null;
        const content = !(loading || error) ? this.renderItems(chars) : null;

        return (
            <div className="char__list">
                {errorMessage}
                {spinner}
                {content}
                <button 
                    className="button button__main button__long"
                    disabled={newItemLoading}
                    style={{'display': charEnded ? 'none' : 'block'}}
                    onClick={() => this.onRequest(offset)}
                >
                    <div className="inner">load more</div>
                </button>
            </div>
        );
    }
}

export default CharList;