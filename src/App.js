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

const GET_ORGANIZATION_REPO_ISSUES = `
  query($organization: String!, $repository: String!, $cursor: String) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        id
        name
        url
        stargazers {
          totalCount
        }
        viewerHasStarred
        issues(first: 5, after: $cursor, states: [OPEN]) {
          edges {
            node {
              id
              title
              url
              reactions(last: 3) {
                edges {
                  node {
                    id
                    content
                  }
                }
              }
            }
          }
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`

const ADD_STAR = `
  mutation ($repositoryId: ID!) {
    addStar(input: {starrableId: $repositoryId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`

const REMOVE_STAR = `
  mutation ($repositoryId: ID!) {
    removeStar(input: {starrableId: $repositoryId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`

const getIssuesOfOrgizationRepo = (path, cursor) => {
  const [organization, repository] = path.split('/');

  return ax.post('', { 
    query: GET_ORGANIZATION_REPO_ISSUES,
    variables: {
      organization,
      repository,
      cursor
    }
  })
}

const resolveIssuesQuery = (queryResult, cursor) => state => {
  const { data, errors } = queryResult.data;

  if (!cursor) {
    return {
      organization: data.organization,
      errors,
    };
  }

  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;
  const updatedIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updatedIssues,
        },
      },
    },
    errors,
  };
};

const addStarToRepository = repositoryId => {
  return ax.post('', {
    query: ADD_STAR,
    variables: { repositoryId },
  });
};

const removeStarToRepository = repositoryId => {
  return ax.post('', {
    query: REMOVE_STAR,
    variables: { repositoryId },
  });
};

const resolveAddStarMutation = mutationResult => state => {
  const {
    viewerHasStarred,
  } = mutationResult.data.data.addStar.starrable;

  const { totalCount } = state.organization.repository.stargazers;

  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount + 1,
        },
      },
    },
  };
};

const resolveRemoveStarMutation = mutationResult => state => {
  const {
    viewerHasStarred,
  } = mutationResult.data.data.removeStar.starrable;

  const { totalCount } = state.organization.repository.stargazers;

  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount - 1,
        },
      },
    },
  };
};

class App extends React.Component {
  state = {
    repoPath: 'facebook/react',
    organization: null,
    errors: null
  }

  componentDidMount() {
    this.onFetchFromGithub()
  }

  onFetchFromGithub(cursor) {
    getIssuesOfOrgizationRepo(this.state.repoPath, cursor)
    .then(queryResult =>
      this.setState(resolveIssuesQuery(queryResult, cursor)),
    );
  }

  onStarRepository = (repositoryId, viewerHasStarred) => {
    if(viewerHasStarred) {
      removeStarToRepository(repositoryId).then(mutationResult =>
        this.setState(resolveRemoveStarMutation(mutationResult)),
      );
    } else {
      addStarToRepository(repositoryId).then(mutationResult =>
        this.setState(resolveAddStarMutation(mutationResult)),
      );
    }
    
  };

  fetchMoreIssues = () => {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;
    this.onFetchFromGithub(endCursor);
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.onFetchFromGithub();
  }

  onChange = (e) => {
    this.setState({ repoPath: e.target.value })
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
        
        <Organization 
          organization={organization}
          onFetchMoreIssues={this.fetchMoreIssues}
          onStarRepository={this.onStarRepository}
          errors={errors}/>
      </div>
    )
  }
}

export default App;
