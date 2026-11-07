package cu.observadorcubano.app;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.ScrollView;

/**
 * ScrollView que crece con su contenido hasta un alto máximo y a partir de
 * ahí se desplaza. Evita que las hojas de Secciones/Buscar desborden la
 * pantalla en equipos pequeños o en orientación apaisada.
 */
public class MaxHeightScrollView extends ScrollView {

    private int maxHeightPx = 0;

    public MaxHeightScrollView(Context context) {
        super(context);
    }

    public MaxHeightScrollView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public MaxHeightScrollView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public void setMaxHeightPx(int px) {
        maxHeightPx = px;
        requestLayout();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        if (maxHeightPx > 0) {
            heightMeasureSpec = MeasureSpec.makeMeasureSpec(
                maxHeightPx,
                MeasureSpec.AT_MOST
            );
        }
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }
}
