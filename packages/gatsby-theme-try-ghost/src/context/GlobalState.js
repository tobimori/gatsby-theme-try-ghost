import React from "react"

/**
 * Infinite Scroll
 *
 * Further info 👉🏼 https://github.com/baobabKoodaa/gatsby-starter-infinite-scroll
 *
 * Global state is needed instead of component state, in order
 * to maintain scroll position after page switches.
 *
 */

export const GlobalStateContext = React.createContext({
    cursor: 0, /* Which page infinite scroll should fetch next. */
    useInfiniteScroll: true, /* Fallback in case of error. */
    items: [],
    isLoading: true,
    loadMore: () => {},
    hasMore: () => {},
    isInitializing: () => true,
    updateState: () => {},
})

export class GlobalStateProvider extends React.Component {
    constructor(props) {
        super(props)

        this.loadMore = this.loadMore.bind(this)
        this.hasMore = this.hasMore.bind(this)
        this.updateState = this.updateState.bind(this)
        this.isInitializing = this.isInitializing.bind(this)

        this.state = {
            /*  items contains posts which should be rendered
             *  items is initialized to 1 page of results, in order to:
             *    1. render a page to users who have JS disabled
             *    2. render initial paint fast for all users
             *  the initial page depends on pageContext.currentPage (corresponds to a path like "/", "/2", "/3",...)
             */
            items: [],
            /*
             *  isLoading is used to avoid triggering multiple simultaenous loadings
             */
            isLoading: true,
            /*
             *  cursor represents next page which infinite scroll should fetch
             */
            cursor: 0,
            /*
             * useInfiniteScroll is used to fallback to pagination _on error_
             * note that the fallback to non JS users is not related to this
             */
            useInfiniteScroll: true,
            isInitializing: this.isInitializing,
            updateState: this.updateState,
            hasMore: this.hasMore,
            loadMore: this.loadMore,
        }
    }

    isInitializing = () => (this.state.cursor === 0)

    updateState = (mergeableStateObject) => {
        this.setState(mergeableStateObject)
    }

    componentDidMount() {
        this.setState({ isLoading: false }) // Allow triggering infinite scroll load
    }

    loadMore = () => {
        if (this.state.isLoading) {
            return
        }
        this.setState({ isLoading: true, error: undefined })
        fetch(`${__PATH_PREFIX__}/paginationJson/index${this.state.cursor}.json`) // eslint-disable-line no-undef
            .then(res => res.json())
            .then((res) => {
                this.setState((state) => {
                    return ({
                        items: [...state.items, ...res], // Add resulting post items to state.items
                        cursor: state.cursor + 1, // Update which page should be fetched next
                        isLoading: false, // Loading is complete so a new load can be triggered.
                    })
                })
            }, (error) => {
                this.setState({
                    isLoading: false,
                    error,
                    useInfiniteScroll: false,
                })
            })
    }

    hasMore = pageContext => this.state.cursor <= pageContext.numberOfPages && this.state.useInfiniteScroll

    render() {
        return (
            <GlobalStateContext.Provider value={this.state}>
                {this.props.children}
            </GlobalStateContext.Provider>
        )
    }
}
