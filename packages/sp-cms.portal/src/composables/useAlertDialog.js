import { ref, createApp, h } from 'vue';
import AlertDialog from '../components/ui/AlertDialog.vue';

const isOpen = ref(false);
const dialogConfig = ref({});
let resolvePromise = null;

export function useAlertDialog() {
  const show = config => {
    return new Promise(resolve => {
      resolvePromise = resolve;
      dialogConfig.value = {
        title: config.title || '',
        description: config.text || config.description || '',
        confirmText: config.confirmButtonText || 'Confirm',
        cancelText: config.cancelButtonText || 'Cancel',
        showCancel: config.showCancelButton !== false,
        confirmVariant: config.icon === 'warning' ? 'destructive' : 'default',
        closeOnOverlayClick: config.allowOutsideClick !== false,
        ...config,
      };
      isOpen.value = true;
    });
  };

  const fire = show;

  const confirm = config => {
    return show({
      showCancelButton: true,
      ...config,
    });
  };

  const alert = config => {
    return show({
      showCancelButton: false,
      ...config,
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise({ isConfirmed: true, isDismissed: false });
      resolvePromise = null;
    }
    isOpen.value = false;
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise({ isConfirmed: false, isDismissed: true });
      resolvePromise = null;
    }
    isOpen.value = false;
  };

  const handleUpdateOpen = value => {
    if (!value && resolvePromise) {
      resolvePromise({ isConfirmed: false, isDismissed: true });
      resolvePromise = null;
    }
    isOpen.value = value;
  };

  return {
    isOpen,
    dialogConfig,
    show,
    fire,
    confirm,
    alert,
    handleConfirm,
    handleCancel,
    handleUpdateOpen,
  };
}

let dialogInstance = null;

export const AlertDialogService = {
  fire: async config => {
    if (!dialogInstance) {
      dialogInstance = useAlertDialog();

      const app = createApp({
        setup() {
          return () =>
            h(AlertDialog, {
              open: dialogInstance.isOpen.value,
              ...dialogInstance.dialogConfig.value,
              'onUpdate:open': dialogInstance.handleUpdateOpen,
              onConfirm: dialogInstance.handleConfirm,
              onCancel: dialogInstance.handleCancel,
            });
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      app.mount(container);
    }

    return dialogInstance.fire(config);
  },

  confirm: async config => {
    return AlertDialogService.fire({
      showCancelButton: true,
      ...config,
    });
  },

  alert: async config => {
    return AlertDialogService.fire({
      showCancelButton: false,
      ...config,
    });
  },
};

export default AlertDialogService;
