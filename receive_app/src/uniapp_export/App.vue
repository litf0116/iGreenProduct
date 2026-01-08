<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* Global Styles */
	page {
		background-color: #f8fafc; /* slate-50 */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		color: #0f172a; /* slate-900 */
	}

	.container {
		padding: 20px;
	}

	.card {
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		padding: 16px;
		margin-bottom: 12px;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		border-radius: 6px;
		font-weight: 500;
		font-size: 14px;
	}

	.btn-primary {
		background-color: #2563eb; /* blue-600 */
		color: white;
	}

	.btn-outline {
		background-color: transparent;
		border: 1px solid #e2e8f0; /* slate-200 */
		color: #0f172a;
	}

	.text-sm { font-size: 14px; }
	.text-xs { font-size: 12px; }
	.font-bold { font-weight: 700; }
	.text-slate-500 { color: #64748b; }
	
	.flex { display: flex; }
	.flex-col { flex-direction: column; }
	.items-center { align-items: center; }
	.justify-between { justify-content: space-between; }
	.gap-2 { gap: 8px; }
	.mt-2 { margin-top: 8px; }
	.mb-2 { margin-bottom: 8px; }
</style>
