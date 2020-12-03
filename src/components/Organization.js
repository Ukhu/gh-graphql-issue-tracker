import React from 'react';

const Organization = ({ organization, errors }) => {
  if (errors) {
    return (
      <div>
        <strong>Something went wrong:</strong>
        {errors.map(err => err.message).join(' ')}
      </div>
    )
  }

  if (!organization) {
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
    </div>
  )
};

export default Organization;