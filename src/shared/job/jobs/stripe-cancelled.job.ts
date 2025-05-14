export async function stripePaymentCancelled(data: {tenantId: string, subId: string}) {
    console.log(`Tenant ${data.tenantId} cancelled subscription ${data.subId}`);
}
