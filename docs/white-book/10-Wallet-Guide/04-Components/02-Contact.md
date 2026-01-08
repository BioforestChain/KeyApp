# Contact Components

## Overview

Components for managing and displaying contacts.

## Components

### ContactCard

A shareable card view of a contact.
- **Avatar**: Generated from address if not provided.
- **Name**: User alias.
- **QR Code**: Encoded contact data for easy scanning.
- **Labels**: Color-coded badges for different chains/tags.

### Usage

```tsx
<ContactCard
  name="Alice"
  address="0x123..."
  qrContent="keyapp:contact?name=Alice&addr=0x123"
  addresses={[{ address: '0x123', label: 'Main' }]}
/>
```
