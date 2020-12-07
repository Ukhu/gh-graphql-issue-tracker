import React from 'react';
import Repository from './Repository';

const Organization = ({ organization, errors, onFetchMoreIssues }) => {
  if (errors) {
    return (
      <div>
        <strong>Something went wrong:</strong>
        {errors.map(err => err.message).join(' ')}
      </div>
    )
  }

  if (!organization || !organization.repository) {
    return (
      <p>No information yet ...</p>
    )
  }
  
  return (
    <div>
      <p>
        <strong>Issues from Organization:</strong>
        <a href={organization.url}>{organization.name}</a>
      </p>
      <Repository
        repository={organization.repository}
        onFetchMoreIssues={onFetchMoreIssues}/>
    </div>
  )
};

export default Organization;