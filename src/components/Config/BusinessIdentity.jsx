import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../Common/Card';
import Input from '../Common/Input';
import Button from '../Common/Button';

export default function BusinessIdentity({ outlet, onSave }) {
  const [name, setName] = useState(outlet?.name || '');
  const [logoUrl, setLogoUrl] = useState(outlet?.logo_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ name, logo_url: logoUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3>Business Identity</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Input
            label="Business Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter outlet name"
            disabled={loading}
          />
          <Input
            label="Logo URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            disabled={loading}
          />
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
