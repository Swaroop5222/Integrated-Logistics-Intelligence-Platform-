function ShipmentDetailsPage({ shipment }) {
  const defaultShipment = {
    trackingNumber: 'TRK001',
    status: 'IN TRANSIT',

    sender: {
      name: 'ABC Logistics',
      phone: '+91 9876543210',
      email: 'sender@abclogistics.com',
    },

    receiver: {
      name: 'John Doe',
      phone: '+91 9876543211',
      email: 'john@example.com',
    },

    package: {
      type: 'Electronics',
      weight: '2.5 kg',
      dimensions: '30 × 20 × 15 cm',
    },

    deliveryAddress: 'Chennai, Tamil Nadu, India - 600001',

    timeline: [
      {
        status: 'Created',
        description: 'Shipment has been created.',
        date: '30 Jun 2023, 10:00 AM',
        completed: true,
      },
      {
        status: 'Picked Up',
        description: 'Shipment has been picked up.',
        date: '30 Jun 2023, 12:30 PM',
        completed: true,
      },
      {
        status: 'In Transit',
        description: 'Shipment is on the way.',
        date: '01 Jul 2023, 08:45 AM',
        completed: true,
      },
      {
        status: 'Out for Delivery',
        description: 'Shipment is out for delivery.',
        date: '-',
        completed: false,
      },
      {
        status: 'Delivered',
        description: 'Shipment will be delivered soon.',
        date: '-',
        completed: false,
      },
    ],
  }

  const currentShipment = shipment || defaultShipment

  return (
    <div className="shipment-details-page">

      {/* Top Navigation */}
      <header className="details-navbar">
        <button className="back-button">
          ← Back to Shipments
        </button>

        <div className="user-section">
          <span className="user-icon">♙</span>
          <span>John Smith</span>
          <span>⌄</span>
        </div>
      </header>

      <main className="details-container">

        {/* Shipment Header */}
        <section className="shipment-hero">

          <div className="hero-content">

            <p className="small-title">
              Shipment Details
            </p>

            <h1>
              {currentShipment.trackingNumber}
            </h1>

            <div className="status-section">

              <p>Current Status</p>

              <span className="status-badge">
                ● {currentShipment.status}
              </span>

            </div>

            <p className="last-updated">
              Last Updated: Today, 10:30 AM
            </p>

          </div>

          <div className="truck-illustration">
            🚚
          </div>

        </section>

        {/* Sender + Receiver */}
        <div className="people-grid">

          {/* Sender */}
          <section className="details-card">

            <div className="card-title">
              <span className="card-icon">♙</span>
              <h2>Sender Information</h2>
            </div>

            <div className="info-item">
              <span className="label">Name</span>
              <span className="value">
                {currentShipment.sender.name}
              </span>
            </div>

            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">
                {currentShipment.sender.phone}
              </span>
            </div>

            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">
                {currentShipment.sender.email}
              </span>
            </div>

          </section>

          {/* Receiver */}
          <section className="details-card">

            <div className="card-title">
              <span className="card-icon">♙</span>
              <h2>Receiver Information</h2>
            </div>

            <div className="info-item">
              <span className="label">Name</span>
              <span className="value">
                {currentShipment.receiver.name}
              </span>
            </div>

            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">
                {currentShipment.receiver.phone}
              </span>
            </div>

            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">
                {currentShipment.receiver.email}
              </span>
            </div>

          </section>

        </div>

        {/* Package Information */}
        <section className="details-card package-card">

          <div className="card-title">
            <span className="card-icon">📦</span>
            <h2>Package Information</h2>
          </div>

          <div className="package-grid">

            <div>
              <span className="label">Type</span>
              <span className="package-value">
                {currentShipment.package.type}
              </span>
            </div>

            <div>
              <span className="label">Weight</span>
              <span className="package-value">
                {currentShipment.package.weight}
              </span>
            </div>

            <div>
              <span className="label">Dimensions</span>
              <span className="package-value">
                {currentShipment.package.dimensions}
              </span>
            </div>

          </div>

        </section>

        {/* Delivery Address */}
        <section className="details-card address-card">

          <div className="card-title">
            <span className="card-icon">📍</span>
            <h2>Delivery Address</h2>
          </div>

          <p className="address-text">
            {currentShipment.deliveryAddress}
          </p>

        </section>

        {/* Tracking Timeline */}
        <section className="details-card timeline-card">

          <div className="card-title">
            <span className="card-icon">◷</span>
            <h2>Tracking Timeline</h2>
          </div>

          <div className="tracking-timeline">

            {currentShipment.timeline.map((item, index) => (

              <div
                className={`timeline-row ${
                  item.completed ? 'completed' : ''
                }`}
                key={item.status}
              >

                <div className="timeline-marker">

                  <div className="timeline-dot">
                    {item.completed ? '✓' : ''}
                  </div>

                  {index <
                    currentShipment.timeline.length - 1 && (
                    <div className="timeline-connector"></div>
                  )}

                </div>

                <div className="timeline-content">

                  <div className="timeline-top">

                    <div>
                      <h3>{item.status}</h3>

                      <p>
                        {item.description}
                      </p>
                    </div>

                    <span className="timeline-date">
                      {item.date}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

          <div className="timezone-note">
            <span>ⓘ</span>
            All times shown are in local time zone.
          </div>

        </section>

      </main>

    </div>
  )
}

export default ShipmentDetailsPage
