import { useState } from 'react'

function DeliveryConfirmation({ shipment }) {
  const defaultShipment = {
    trackingNumber: 'TRK001',
    receiver: {
      name: 'John Doe',
    },
    deliveryAddress: 'Chennai, Tamil Nadu, India - 600001',
  }

  const currentShipment = shipment || defaultShipment
  const [receiverName, setReceiverName] = useState(currentShipment.receiver.name)
  const [deliveryStatus, setDeliveryStatus] = useState('DELIVERED')
  const [deliveryDateTime, setDeliveryDateTime] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const handleSubmit = async (event) => {
  event.preventDefault()

  const confirmation = {
    trackingNumber: currentShipment.trackingNumber,
    recipientName: receiverName,
    deliveryAddress: currentShipment.deliveryAddress,
    confirmationMethod: 'SIGNATURE',
    deliveryStatus,
    confirmationTime: deliveryDateTime || null,
    deliveryNotes,
  }

  try {
    const response = await fetch(
      'http://localhost:8080/api/delivery-confirmations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmation),
      }
    )

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const savedConfirmation = await response.json()

    console.log('Delivery confirmation saved:', savedConfirmation)
  } catch (error) {
    console.error('Failed to save delivery confirmation:', error)
  }
}

  return (
    <div>
      <h1>Digital Delivery Confirmation</h1>

<div>
  <p>
    <strong>Tracking Number:</strong> {currentShipment.trackingNumber}
  </p>

  <p>
    <strong>Delivery Address:</strong> {currentShipment.deliveryAddress}
  </p>
</div>

<form onSubmit={handleSubmit}>        
	<div>
          <label>Receiver Name</label>
          <input
            type="text"
            value={receiverName}
            onChange={(event) => setReceiverName(event.target.value)}
            placeholder="Enter receiver name"
          />
        </div>

        <div>
          <label>Delivery Status</label>
          <select
            value={deliveryStatus}
            onChange={(event) => setDeliveryStatus(event.target.value)}
          >
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div>
          <label>Delivery Date & Time</label>
          <input
            type="datetime-local"
            value={deliveryDateTime}
            onChange={(event) => setDeliveryDateTime(event.target.value)}
          />
        </div>

        <div>
          <label>Delivery Notes</label>
          <textarea
            value={deliveryNotes}
            onChange={(event) => setDeliveryNotes(event.target.value)}
            placeholder="Enter delivery notes"
          />
        </div>

        <button type="submit">Confirm Delivery</button>
      </form>
    </div>
  )
}

export default DeliveryConfirmation