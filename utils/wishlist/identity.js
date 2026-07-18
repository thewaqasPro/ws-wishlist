const VISITOR_PATTERN = /^[A-Za-z0-9_-]{16,100}$/;

export function getWishlistIdentity(req) {
  const customerIdRaw = Array.isArray(req.query.logged_in_customer_id)
    ? req.query.logged_in_customer_id[0]
    : req.query.logged_in_customer_id;
  const visitorRaw = Array.isArray(req.query.visitor_id)
    ? req.query.visitor_id[0]
    : req.query.visitor_id;

  const customerId =
    customerIdRaw && /^\d+$/.test(String(customerIdRaw))
      ? String(customerIdRaw)
      : null;
  const visitorId =
    visitorRaw && VISITOR_PATTERN.test(String(visitorRaw))
      ? String(visitorRaw)
      : null;

  return {
    customerId,
    visitorId,
    key: customerId
      ? `customer:${customerId}`
      : visitorId
        ? `visitor:${visitorId}`
        : null,
  };
}
