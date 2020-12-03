import React from 'react';
import axios from 'axios';
import Organization from './components/Organization';

const ax = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`
  }
})

const TITLE = 'React GraphQL Github Client';

const GET_ORGANIZATION = `
  {
    organization(login: "facebook") {
      name
      url
    }
  }
`

class App extends React.Component {
  state = {
    repoPath: 'facebook/react',
    organization: null,
    errors: null
  }

  componentDidMount() {
    ax.post('', { query: GET_ORGANIZATION })
      .then(response => {
        const { data, errors } = response.data;
        this.setState({
          organization: data && response.data.data.organization,
          errors: errors && response.data.errors
        })
      })
  }

  onSubmit = (e) => {
    e.preventDefault();
  }

  onChange = (e) => {
    this.setState({ path: e.target.value })
  }

  render() {
    const { repoPath, organization, errors } = this.state;

    return(
      <div>
        <h1>{TITLE}</h1>

        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">
            Show open issues for https://github.com/
          </label>
          <input
            id="url"
            type="text"
            value={repoPath}
            onChange={this.onChange}
            style={{ width: '300px' }}
          />
          <button type="submit">Search</button>
        </form>

        <hr />
        
        <Organization organization={organization} errors={errors}/>
      </div>
    )
  }
}

export default App;
