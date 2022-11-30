export const objectGUIDToUUID = (objectGUID) => {
  const hexValue = Buffer.from(objectGUID, 'binary').toString('hex');

  return hexValue.replace(
  //   (   $1:A4   )(   $2:A3   )(   $3:A2   )(   $4:A1   )(   $5:B2   )(   $6:B1   )(   $7:C2   )(   $8:C1   )(   $9:D    )(   $10:F    )
    /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{4})([0-9a-f]{10})/,
    '$4$3$2$1-$6$5-$8$7-$9-$10'
  );
};
